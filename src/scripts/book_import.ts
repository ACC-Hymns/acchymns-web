import { fetchCachedJSON } from "@/composables/cached_fetch";
import { type BookSummary, type SongList, type BookIndex, type BookDataSummary, BookSourceType, type BookSignature, type UpdatePackage } from "@/scripts/types";
import { branch, known_references, prepackaged_book_urls, prepackaged_books, public_references } from "@/scripts/constants";
import { Preferences } from "@capacitor/preferences";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import type { DownloadFileResult, FileInfo } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

async function getBookUrls() {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");
    return book_sources.filter(b => (b.status != BookSourceType.PREVIEW && b.status != BookSourceType.HIDDEN)).map(b => b.src);
}

function getPathFromSignatureNode(node: BookSignature): string {
    let names: string[] = [];
    let current_node = node;
    while(current_node.parent != null && current_node.parent != undefined) {
        names.push(current_node.name);
        current_node = current_node.parent;
    }
    names = names.reverse();
    let path = names.join("/")
    return path;
}

function verifySignatures(local: BookSignature, origin: BookSignature): BookSignature[] {
    let results: BookSignature[] = [];

    if(local.hash != origin.hash)
        results = results.concat([local])

    if(local.children != undefined && origin.children != undefined) {
        for(var i = 0; i < local.children.length; i++) {
            local.children[i].parent = {
                name: local.name,
                hash: local.hash,
                parent: local.parent
            }
            let result = verifySignatures(local.children[i], origin.children[i])
            if(result != null && result != undefined) {
                results = results.concat(result);
            }
        }
    }
    
    return results;
}

async function checkForUpdates(): Promise<UpdatePackage[]> {
    console.log("Checking for updates...")
    if(Capacitor.getPlatform() !== "web") {
        const book_signature: BookSignature[] = await (await fetch(`https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/book_signatures.json`)).json();
        let return_packages: UpdatePackage[] = [];

        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: "Hymnals/"
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: "Hymnals/"
            })
        }

        let book_dir = await Filesystem.readdir({
            directory: Directory.Documents,
            path: "Hymnals/"
        });
        
        for(let f in book_dir.files) {
            let file = book_dir.files[f];

            if(file.type != "directory")
                continue;

            if(!(prepackaged_books.concat(Object.keys(known_references)).includes(file.name)))
                continue;

            let signature_blob = await Filesystem.readFile({
                directory: Directory.Documents,
                path: `Hymnals/${file.name}/.signature`
            })
            let signature_data = JSON.parse(atob(signature_blob.data.toString()));
            let updated_signature_data = book_signature.find(sig => sig.name == signature_data.name);
            if(updated_signature_data == undefined)
                continue;

            console.log(`Verification Results (${signature_data.name})`)
            let verification_error = verifySignatures(signature_data, updated_signature_data);

            if(verification_error.length < 1)
                continue;

            let broken_file_paths: string[] = [];
            for(var i = 1; i < verification_error.length; i++) {
                let bad_file: BookSignature = verification_error[i];
                broken_file_paths.push(getPathFromSignatureNode(bad_file));
                console.log("Must redownload " + bad_file.name);
            }

            let update_package: UpdatePackage = {
                book_short: signature_data.name,
                paths: broken_file_paths
            }
            return_packages.push(update_package);
        }
        console.log("RETURN PACKAGES")
        console.log(return_packages);
        return return_packages;
    }
    return [];
}

async function loadBookSources() {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");

    console.log("Loading Pre-Packaged Books...")
    for(let url in prepackaged_book_urls) {
        if(book_sources.find(b => b.src == prepackaged_book_urls[url]))
            continue;
        
        book_sources.push({
            id: prepackaged_books[url],
            status: BookSourceType.BUNDLED,
            
            src: prepackaged_book_urls[url]
        });
    }

    // load downloaded books
    console.log("Loading Downloaded Books...")
    book_sources = book_sources.filter(b => b.status != BookSourceType.DOWNLOADED);
    if(Capacitor.getPlatform() !== "web") {
        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: "Hymnals/"
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: "Hymnals/"
            })
        }

        let book_dir = await Filesystem.readdir({
            directory: Directory.Documents,
            path: "Hymnals/"
        });
        
        for(let f in book_dir.files) {
            let file = book_dir.files[f];

            if(file.type != "directory")
                continue;

            if(!(prepackaged_books.concat(Object.keys(known_references)).includes(file.name)))
                continue;

            book_sources.push({
                id: file.name,
                status: BookSourceType.DOWNLOADED,
                src: Capacitor.convertFileSrc(file.uri)
            });
        }
    }

    console.log("Loading Importable Books...")
    for(let book in known_references) {
        let skip = false;
        for(let b in book_sources) {
            if(book_sources[b].id === book) {
                skip = true;
                break;
            }
        }
        if(skip)
            continue;
        
        let url = known_references[book as keyof typeof known_references]

        let entry: BookDataSummary = {
            id: book,
            status: (Object.keys(public_references).includes(book)) ? BookSourceType.PREVIEW : BookSourceType.HIDDEN,
            src: url
        };

        let summary: BookSummary | null = await fetchBookSummary(url);
        if(summary) {
            entry.name = summary.name;
            entry.primaryColor = summary.primaryColor;
            entry.secondaryColor = summary.secondaryColor;
        }

        book_sources.push(entry);
    }

    console.log("Finished loading sources!")
    Preferences.set({key: "bookSources", value: JSON.stringify(book_sources)})
    return book_sources;
}

async function getBookDataSummary(book: BookSummary | null) {
    if(book == null)
        return;

    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");

    return book_sources.find(b => b.id == book.name.short);
}
async function getBookDataSummaryFromName(book: string) {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");

    return book_sources.find(b => b.id == book);
}

async function download_update_package(update: UpdatePackage, progress_callback: (progress: number) => void, finish_callback: () => void) {
    for(var i = 0; i < update.paths.length; i++) {
        let path = update.paths[i];
        console.log(`Downloading (${update.book_short}/${path})`);
        await Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `Hymnals/${update.book_short}/${path}`,
            progress: false,
            url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${update.book_short}/${path}`
        });
        progress_callback((i + 1)/update.paths.length);
    }
    await Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `Hymnals/${update.book_short}/.signature`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${update.book_short}/.signature`
    })
    finish_callback();
}

async function download_book(book: BookDataSummary, progress_callback: (book: BookDataSummary, progress: number) => void, finish_callback: (book: BookDataSummary, url: string) => void) {    
    let book_summary = await fetchBookSummary(`https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}`)
    let ext = book_summary?.fileExtension;
    let songs: SongList | null = await getSongMetaData(book.id);
    console.log(songs)
    let num_of_songs = Object.entries(songs as any).length;

    // setup folder structure
    Filesystem.mkdir({
        directory: Directory.Documents,
        path: `Hymnals`
    })
    Filesystem.mkdir({
        directory: Directory.Documents,
        path: `Hymnals/${book.id}`
    })
    Filesystem.mkdir({
        directory: Directory.Documents,
        path: `Hymnals/${book.id}/songs`
    })

    Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `Hymnals/${book.id}/songs.json`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/songs.json`
    })

    // Download book signature for updates
    Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `Hymnals/${book.id}/.signature`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/.signature`
    })
    
    if(book_summary?.indexAvailable) {
        Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `Hymnals/${book.id}/index.json`,
            progress: false,
            url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/index.json`
        }).then((result) => {
            console.log(result.path);
        }).catch(err => {
            console.log("Ignored File: " + err);
        });
    }
    

    var i = 0;
    for(let song_number in songs) {
        let url = `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/songs/${song_number}.${ext}`
        Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `Hymnals/${book.id}/songs/${song_number}.${ext}`,
            progress: false,
            url: url
        }).then((result) => {
            i++;
            let download_progress = `${i/num_of_songs*100}%`;
            progress_callback(book, i/num_of_songs*100);
            if(i/num_of_songs >= 1) {

                Filesystem.downloadFile({
                    directory: Directory.Documents,
                    path: `Hymnals/${book.id}/summary.json`,
                    progress: false,
                    url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/summary.json`
                }).then((new_result: DownloadFileResult) => {
                    console.log(`${book.id} has finished downloading.`);
                    let summary_path: string = new_result.path || "";
                    summary_path = summary_path.replace("/summary.json", "");

                    // this is used for calling fetch on downloaded books
                    let web_url = Capacitor.convertFileSrc(summary_path);
                    finish_callback(book, web_url);
                });
            }
        });
    }
}

async function fetchBookSummary(url: string, options: RequestInit & { timeout?: number } = { timeout: 500 }) {
    return await fetchCachedJSON<BookSummary>(`${url}/summary.json`, options).then(book => {
        if (book == null) {
            return null;
        }
        book.srcUrl = url;
        return book;
    });
}

async function getAllBookMetaData() {
    const now = performance.now();
    const book_urls = await getBookUrls();
    const to_fetch = book_urls.map(url => fetchBookSummary(url));

    const bookSummary = (await Promise.all(to_fetch)).filter(summary => summary != null) as BookSummary[];

    const temp = Object.fromEntries(bookSummary.map((summary, _) => [summary.name.short, summary]));
    console.log("BOOK_METADATA:", performance.now() - now);
    return temp;
}

async function getAllSongMetaData() {
    const now = performance.now();
    const book_urls = await getBookUrls();
    const to_fetch = book_urls.map(url => fetchCachedJSON<SongList>(`${url}/songs.json`, {}));

    const bookSongs = (await Promise.all(to_fetch)).filter(list => list != null) as SongList[];
    const BOOK_METADATA = await getAllBookMetaData();
    const temp = Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
    console.log("SONG_METADATA:", performance.now() - now);
    return temp;
}

async function getSongMetaData(book_short_name: string): Promise<SongList | null> {
    const BOOK_METADATA = await getAllBookMetaData();
    console.log(BOOK_METADATA)
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchCachedJSON(`${BOOK_METADATA[book_short_name].srcUrl}/songs.json`, {});
    }
    return null;
}

async function getBookFromId(book_short_name: string): Promise<BookSummary | undefined> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return BOOK_METADATA[book_short_name];
    }
    return undefined;
}

async function getBookIndex(book_short_name: string): Promise<BookIndex | null> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchCachedJSON(`${BOOK_METADATA[book_short_name].srcUrl}/index.json`, {});
    }
    return null;
}

export { download_update_package, getBookFromId, getBookDataSummaryFromName, getBookDataSummary, loadBookSources, download_book, getBookUrls, fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex, checkForUpdates };
