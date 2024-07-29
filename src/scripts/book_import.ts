import { fetchCachedJSON } from "@/composables/cached_fetch";
import {
    type BookSummary,
    type SongList,
    type BookIndex,
    type BookDataSummary,
    BookSourceType,
    type BookSignature,
    type UpdatePackage,
    type DownloadPromise,
} from "@/scripts/types";
import {
    branch,
    known_references,
    prepackaged_book_urls,
    prepackaged_books,
    public_references,
} from "@/scripts/constants";
import { Preferences } from "@capacitor/preferences";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import type { DownloadFileResult, FileInfo } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { useCapacitorPreferences } from "@/composables/preferences";
import router from "@/router";

async function getBookUrls() {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    const book_sources: BookDataSummary[] = JSON.parse(
        book_sources_raw.value ?? "[]",
    );
    return book_sources
        .filter(
            (b) =>
                b.status != BookSourceType.PREVIEW &&
                b.status != BookSourceType.HIDDEN,
        )
        .map((b) => b.src);
}

function getPathFromSignatureNode(node: BookSignature): string {
    let names: string[] = [];
    let current_node = node;
    while (current_node.parent != null && current_node.parent != undefined) {
        names.push(current_node.name);
        current_node = current_node.parent;
    }
    names = names.reverse();
    const path = names.join("/");
    return path;
}

function verifySignatures(
    local: BookSignature,
    origin: BookSignature,
): BookSignature[] {
    let results: BookSignature[] = [];

    if (local.hash != origin.hash) results = results.concat([local]);

    if (local.children != undefined && origin.children != undefined) {
        for (let i = 0; i < local.children.length; i++) {
            local.children[i].parent = {
                name: local.name,
                hash: local.hash,
                parent: local.parent,
            };
            const result = verifySignatures(
                local.children[i],
                origin.children[i],
            );
            if (result != null && result != undefined) {
                results = results.concat(result);
            }
        }
    }

    return results;
}

async function checkForUpdates(): Promise<UpdatePackage[]> {
    console.log("Checking for updates...");
    if (Capacitor.getPlatform() !== "web") {
        const book_signature: BookSignature[] = await (
            await fetch(
                `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/book_signatures.json`,
            )
        ).json();
        const return_packages: UpdatePackage[] = [];

        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: "Hymnals/",
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: "Hymnals/",
            });
        }

        const book_dir = await Filesystem.readdir({
            directory: Directory.Documents,
            path: "Hymnals/",
        });

        for (const f in book_dir.files) {
            const file = book_dir.files[f];

            if (file.type != "directory") continue;

            if (
                !prepackaged_books
                    .concat(Object.keys(known_references))
                    .includes(file.name)
            )
                continue;

            const signature_blob = await Filesystem.readFile({
                directory: Directory.Documents,
                path: `Hymnals/${file.name}/.signature`,
            });
            const signature_data = JSON.parse(
                atob(signature_blob.data.toString()),
            );
            const updated_signature_data = book_signature.find(
                (sig) => sig.name == signature_data.name,
            );
            if (updated_signature_data == undefined) continue;

            console.log(`Verification Results (${signature_data.name})`);
            const verification_error = verifySignatures(
                signature_data,
                updated_signature_data,
            );

            if (verification_error.length < 1) continue;

            const broken_file_paths: string[] = [];
            for (let i = 1; i < verification_error.length; i++) {
                const bad_file: BookSignature = verification_error[i];
                broken_file_paths.push(getPathFromSignatureNode(bad_file));
                console.log("Must redownload " + bad_file.name);
            }

            const update_package: UpdatePackage = {
                book_short: signature_data.name,
                paths: broken_file_paths,
            };
            return_packages.push(update_package);
        }
        return return_packages;
    }
    return [];
}

async function loadBookSources() {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(
        book_sources_raw.value ?? "[]",
    );

    console.log("Loading Pre-Packaged Books...");
    for (const url in prepackaged_book_urls) {
        const existing = book_sources.find(
            (b) => b.src == prepackaged_book_urls[url],
        );
        const summary: BookSummary | null = await fetchBookSummary(
            prepackaged_book_urls[url],
        );

        if (existing != undefined) {
            existing.name = summary?.name;
            existing.primaryColor = summary?.primaryColor;
            existing.secondaryColor = summary?.secondaryColor;
            continue;
        }

        book_sources.push({
            id: prepackaged_books[url],
            status: BookSourceType.BUNDLED,
            src: prepackaged_book_urls[url],
            name: summary?.name,
            primaryColor: summary?.primaryColor,
            secondaryColor: summary?.secondaryColor,
        });
    }

    // load downloaded books
    console.log("Loading Downloaded Books...");
    book_sources = book_sources.filter(
        (b) => b.status != BookSourceType.DOWNLOADED,
    );
    if (Capacitor.getPlatform() !== "web") {
        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: "Hymnals/",
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: "Hymnals/",
            });
        }

        const book_dir = await Filesystem.readdir({
            directory: Directory.Documents,
            path: "Hymnals/",
        });

        for (const f in book_dir.files) {
            const file = book_dir.files[f];

            if (file.type != "directory") continue;

            if (
                !prepackaged_books
                    .concat(Object.keys(known_references))
                    .includes(file.name)
            )
                continue;

            try {
                await Filesystem.stat({
                    directory: Directory.Documents,
                    path: `Hymnals/${file.name}/summary.json`,
                });
            } catch (e) {
                continue;
            }

            const existing_book = book_sources.find(
                (book) => book.id == file.name,
            );
            if (existing_book != undefined) {
                book_sources.splice(book_sources.indexOf(existing_book), 1);
            }

            const summary: BookSummary | null = await fetchBookSummary(
                Capacitor.convertFileSrc(file.uri),
            );

            book_sources.push({
                id: file.name,
                status: BookSourceType.DOWNLOADED,
                src: Capacitor.convertFileSrc(file.uri),
                name: summary?.name,
                primaryColor: summary?.primaryColor,
                secondaryColor: summary?.secondaryColor,
            });
        }
    }

    console.log("Loading Importable Books...");
    for (const book in known_references) {
        let skip = false;
        for (const b in book_sources) {
            if (book_sources[b].id === book) {
                skip = true;
                if (book_sources[b].status == BookSourceType.IMPORTED) {
                    if (Capacitor.getPlatform() === "web") {
                        const summary: BookSummary | null =
                            await fetchBookSummary(book_sources[b].src);
                        if (summary) {
                            book_sources[b].name = summary.name;
                            book_sources[b].primaryColor = summary.primaryColor;
                            book_sources[b].secondaryColor =
                                summary.secondaryColor;
                        }
                        break;
                    }

                    let source_path = "";
                    try {
                        const result = await Filesystem.stat({
                            directory: Directory.Documents,
                            path: `Imports/${book}`,
                        });
                        source_path = result.uri;
                    } catch (e) {
                        if ((await Network.getStatus()).connected) {
                            console.log(
                                "No local summary found for " +
                                    book +
                                    ". Downloading now...",
                            );
                            const result = await download_import_summary(
                                book_sources[b],
                            );
                            source_path =
                                result.path?.replace("/summary.json", "") || "";
                        } else {
                            console.log(
                                "No local summary found for " +
                                    book +
                                    ". Skipping...",
                            );
                        }
                    }

                    if (source_path == "") break;

                    const summary: BookSummary | null = await fetchBookSummary(
                        Capacitor.convertFileSrc(source_path),
                    );
                    if (summary) {
                        book_sources[b].name = summary.name;
                        book_sources[b].primaryColor = summary.primaryColor;
                        book_sources[b].secondaryColor = summary.secondaryColor;
                    }
                }
                break;
            }
        }
        if (skip) continue;

        const url = known_references[book as keyof typeof known_references];

        const entry: BookDataSummary = {
            id: book,
            status: Object.keys(public_references).includes(book)
                ? BookSourceType.PREVIEW
                : BookSourceType.HIDDEN,
            src: url,
        };

        book_sources.push(entry);
    }

    console.log("Finished loading sources!");
    Preferences.set({
        key: "bookSources",
        value: JSON.stringify(book_sources),
    });
    return book_sources;
}

async function getBookDataSummary(book: BookSummary | null) {
    if (book == null) return;

    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    const book_sources: BookDataSummary[] = JSON.parse(
        book_sources_raw.value ?? "[]",
    );

    return book_sources.find((b) => b.id == book.name.short);
}
async function getBookDataSummaryFromName(book: string) {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    const book_sources: BookDataSummary[] = JSON.parse(
        book_sources_raw.value ?? "[]",
    );

    return book_sources.find((b) => b.id == book);
}

async function collect_signatures(start: BookSignature) {
    let hashes: BookSignature[] = [];

    if (start.children == undefined) {
        hashes.push(start);
        return hashes;
    }

    for (const child of start.children) {
        child.parent = start;
        const children_hashes = await collect_signatures(child);
        hashes = hashes.concat(children_hashes);
    }

    return hashes;
}

const book_sources = useCapacitorPreferences<BookDataSummary[]>(
    "bookSources",
    [],
);
async function handle_missing_book(book_short: string) {
    if (book_sources.value.length == 0) {
        book_sources.value = await loadBookSources();
    }

    await addImportedBookByCode(book_short);
    async function addImportedBookByCode(short_book_name: string) {
        if (short_book_name in known_references) {
            const to_import = book_sources.value.find(
                (b) => b.id == short_book_name,
            );
            if (to_import == undefined) return;

            // Check for duplicate url
            if (
                to_import.status == BookSourceType.IMPORTED ||
                to_import.status == BookSourceType.DOWNLOADED
            ) {
                return;
            } else {
                if (await addImportedURL(to_import, false)) {
                    router.go(0);
                }
            }
        }
    }

    async function addImportedURL(
        input_book: BookDataSummary,
        show_on_success: boolean = true,
    ): Promise<boolean> {
        const book = book_sources.value.find((b) => b.id == input_book.id);
        if (book == undefined) return false;

        const connection = (await Network.getStatus()).connected;
        if (connection) {
            if (Capacitor.getPlatform() !== "web")
                await download_import_summary(book);
        } else {
            return false;
        }

        let resp: Response | null = null;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            resp = await fetch(book.src + "/summary.json", {
                method: "HEAD",
                signal: controller.signal,
            });
            clearTimeout(id);
        } catch (e: any) {
            if (e.name == "TypeError") {
                return false;
            }
            if (e.name != "AbortError") {
                throw e;
            }
        }

        if (resp == null || !resp.ok || resp.status != 200) {
            return false;
        }

        if (book.status != BookSourceType.IMPORTED) {
            book.status = BookSourceType.IMPORTED;
            return true;
        } else {
            return false;
        }
    }
}

async function generate_force_update_package() {
    const update_packages: UpdatePackage[] = [];
    const local_hashes: BookSignature[] = await (
        await fetch(import.meta.env.BASE_URL + `book_signatures.json`)
    ).json();
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    const book_sources: BookDataSummary[] = JSON.parse(
        book_sources_raw.value ?? "[]",
    );
    const local_books = book_sources.filter(
        (book) => book.status == BookSourceType.DOWNLOADED,
    );
    for (const book of local_books) {
        const hash = local_hashes.find((hash) => hash.name == book.id);
        if (hash == undefined) continue;
        const signatures = await collect_signatures(hash);
        const paths = (await signatures).map((sig) =>
            getPathFromSignatureNode(sig),
        );

        const update: UpdatePackage = {
            book_short: book.id,
            paths: paths,
        };
        update_packages.push(update);
    }
    return update_packages;
}

async function download_update_package(
    update: UpdatePackage,
    progress_callback: (progress: number) => void,
    finish_callback: () => void,
) {
    for (let i = 0; i < update.paths.length; i++) {
        const path = update.paths[i];
        console.log(`Downloading (${update.book_short}/${path})`);
        await Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `Hymnals/${update.book_short}/${path}`,
            progress: false,
            url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${update.book_short}/${path}`,
        });
        progress_callback((i + 1) / update.paths.length);
    }
    await Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `Hymnals/${update.book_short}/.signature`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${update.book_short}/.signature`,
    });
    finish_callback();
}

async function delete_import_summary(book: BookDataSummary) {
    await Filesystem.rmdir({
        directory: Directory.Documents,
        path: `Imports/${book.id}`,
        recursive: true,
    });
}

async function download_import_summary(book: BookDataSummary) {
    // setup folder structure
    try {
        await Filesystem.stat({
            directory: Directory.Documents,
            path: "Imports/",
        });
    } catch (e) {
        await Filesystem.mkdir({
            directory: Directory.Documents,
            path: "Imports/",
        });
    }

    try {
        await Filesystem.stat({
            directory: Directory.Documents,
            path: `Imports/${book.id}`,
        });
    } catch (e) {
        await Filesystem.mkdir({
            directory: Directory.Documents,
            path: `Imports/${book.id}`,
        });
    }

    const result = await Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `Imports/${book.id}/summary.json`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/summary.json`,
    });

    return result;
}

async function clean_up_cancel(book: BookDataSummary) {
    await Filesystem.rmdir({
        directory: Directory.Documents,
        path: `Hymnals/${book.id}`,
        recursive: true,
    });
}

function download_book(
    book: BookDataSummary,
    progress_callback: (book: BookDataSummary, progress: number) => void,
    finish_callback: (book: BookDataSummary, url: string) => void,
): DownloadPromise {
    let cancel_download = false;
    async function async_download_book(
        book: BookDataSummary,
        progress_callback: (book: BookDataSummary, progress: number) => void,
        finish_callback: (book: BookDataSummary, url: string) => void,
    ) {
        const book_summary = await fetchBookSummary(
            `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}`,
        );
        const ext = book_summary?.fileExtension;
        const songs: SongList | null = await getSongMetaData(book.id);
        const num_of_songs = Object.entries(songs as any).length;

        // setup folder structure
        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: "Hymnals/",
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: "Hymnals/",
            });
        }

        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: `Hymnals/${book.id}`,
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: `Hymnals/${book.id}`,
            });
        }

        try {
            await Filesystem.stat({
                directory: Directory.Documents,
                path: `Hymnals/${book.id}/songs`,
            });
        } catch (e) {
            await Filesystem.mkdir({
                directory: Directory.Documents,
                path: `Hymnals/${book.id}/songs`,
            });
        }

        await Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `Hymnals/${book.id}/songs.json`,
            progress: false,
            url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/songs.json`,
        });

        if (cancel_download) {
            clean_up_cancel(book);
            throw new Error("Download Cancelled");
        }

        // Download book signature for updates
        await Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `Hymnals/${book.id}/.signature`,
            progress: false,
            url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/.signature`,
        });

        if (cancel_download) {
            clean_up_cancel(book);
            throw new Error("Download Cancelled");
        }

        if (book_summary?.indexAvailable) {
            await Filesystem.downloadFile({
                directory: Directory.Documents,
                path: `Hymnals/${book.id}/index.json`,
                progress: false,
                url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/index.json`,
            });
        }

        if (cancel_download) {
            clean_up_cancel(book);
            throw new Error("Download Cancelled");
        }

        let i = 0;
        const chunk_size = 10;
        let download_chunk_count = 0;
        function wait_for_downloads(): Promise<void> {
            return new Promise((resolve) => {
                const start_time = Date.now();
                function check() {
                    if (download_chunk_count <= 0) resolve();
                    else if (Date.now() > start_time + 30000)
                        // timeout after 30 seconds per chunk
                        resolve();
                    else {
                        setTimeout(check, 250);
                    }
                }
                check();
            });
        }

        for (const song_number in songs) {
            const url = `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/songs/${song_number}.${ext}`;
            Filesystem.downloadFile({
                directory: Directory.Documents,
                path: `Hymnals/${book.id}/songs/${song_number}.${ext}`,
                progress: false,
                url: url,
            }).then(() => {
                download_chunk_count -= 1;
            });
            download_chunk_count++;

            if (download_chunk_count >= chunk_size) {
                await wait_for_downloads();
            }

            i++;
            if (cancel_download) {
                clean_up_cancel(book);
                throw new Error("Download Cancelled");
            }

            const download_progress = `${(i / num_of_songs) * 100}%`;
            progress_callback(book, (i / num_of_songs) * 100);

            // check for final song
            if (i / num_of_songs >= 1) {
                Filesystem.downloadFile({
                    directory: Directory.Documents,
                    path: `Hymnals/${book.id}/summary.json`,
                    progress: false,
                    url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/summary.json`,
                }).then((new_result: DownloadFileResult) => {
                    console.log(`${book.id} has finished downloading.`);
                    let summary_path: string = new_result.path || "";
                    summary_path = summary_path.replace("/summary.json", "");

                    // this is used for calling fetch on downloaded books
                    const web_url = Capacitor.convertFileSrc(summary_path);
                    finish_callback(book, web_url);
                });
            }
        }
    }
    return {
        cancel: () => {
            return new Promise(function (resolve) {
                console.log("Attempting to cancel download!");
                cancel_download = true;
                resolve();
            });
        },
        promise: async_download_book(book, progress_callback, finish_callback),
    };
}

async function fetchBookSummary(
    url: string,
    options: RequestInit & { timeout?: number } = { timeout: 500 },
) {
    return await fetchCachedJSON<BookSummary>(
        `${url}/summary.json`,
        options,
    ).then((book) => {
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
    const to_fetch = book_urls.map((url) => fetchBookSummary(url));

    const bookSummary = (await Promise.all(to_fetch)).filter(
        (summary) => summary != null,
    ) as BookSummary[];

    const temp = Object.fromEntries(
        bookSummary.map((summary, _) => [summary.name.short, summary]),
    );
    console.log("BOOK_METADATA:", performance.now() - now);
    return temp;
}

async function getAllSongMetaData() {
    const now = performance.now();
    const book_urls = await getBookUrls();
    const to_fetch = book_urls.map((url) =>
        fetchCachedJSON<SongList>(`${url}/songs.json`, {}),
    );

    const bookSongs = (await Promise.all(to_fetch)).filter(
        (list) => list != null,
    ) as SongList[];
    const BOOK_METADATA = await getAllBookMetaData();
    const temp = Object.fromEntries(
        Object.keys(BOOK_METADATA).map((book_name, i) => [
            book_name,
            bookSongs[i],
        ]),
    );
    console.log("SONG_METADATA:", performance.now() - now);
    return temp;
}

async function getSongMetaData(
    book_short_name: string,
): Promise<SongList | null> {
    const BOOK_METADATA = await getAllBookMetaData();
    console.log(BOOK_METADATA);
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchCachedJSON(
            `${BOOK_METADATA[book_short_name].srcUrl}/songs.json`,
            {},
        );
    }
    return null;
}

async function getBookFromId(
    book_short_name: string,
): Promise<BookSummary | undefined> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return BOOK_METADATA[book_short_name];
    }
    return undefined;
}

async function getBookIndex(
    book_short_name: string,
): Promise<BookIndex | null> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchCachedJSON(
            `${BOOK_METADATA[book_short_name].srcUrl}/index.json`,
            {},
        );
    }
    return null;
}

export {
    handle_missing_book,
    generate_force_update_package,
    download_update_package,
    getBookFromId,
    getBookDataSummaryFromName,
    getBookDataSummary,
    loadBookSources,
    download_book,
    getBookUrls,
    fetchBookSummary,
    getAllBookMetaData,
    getAllSongMetaData,
    getSongMetaData,
    getBookIndex,
    checkForUpdates,
    delete_import_summary,
    download_import_summary,
};
