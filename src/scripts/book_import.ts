import { fetchCachedJSON } from "@/composables/cached_fetch";
import { type BookSummary, type SongList, type BookIndex, type BookDataSummary, BookSourceType } from "@/scripts/types";
import { branch, known_references, prepackaged_book_urls, prepackaged_books, public_references } from "@/scripts/constants";
import { Preferences } from "@capacitor/preferences";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import type { DownloadFileResult, FileInfo } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { loaded } from "tone";
import { useCapacitorPreferences } from "@/composables/preferences";

async function getBookUrls() {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");
    return book_sources.filter(b => b.status != BookSourceType.PREVIEW).map(b => b.src);
}

async function loadBookSources() {
    const book_sources_raw = await Preferences.get({ key: "bookSources" });
    let book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");

    for(let url in prepackaged_book_urls) {
        if(book_sources.find(b => b.src == prepackaged_book_urls[url]))
            continue;
        
        book_sources.push({
            id: prepackaged_books[url],
            status: BookSourceType.BUNDLED,
            src: prepackaged_book_urls[url]
        });
    }

    for(let book in public_references) {
        let url = eval(`public_references.${book}`); // mega sketch but nothing else works in typescript
        let skip = false;
        for(let b in book_sources) {
            if(book_sources[b].id == book) {
                skip = true;
                break;
            }
        }
        if(skip)
            continue;
        
        
        book_sources.push({
            id: book,
            status: BookSourceType.PREVIEW,
            src: url
        });
    }

    //console.log(book_sources.value)
    // load downloaded books

    Preferences.set({key: "bookSources", value: JSON.stringify(book_sources)})
}

async function download_book(book: BookDataSummary, progress_callback: (book: BookDataSummary, progress: number) => void, finish_callback: (book: BookDataSummary, url: string) => void) {    
    let book_summary = await fetchBookSummary(`https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}`)
    let ext = book_summary?.fileExtension;
    let songs: SongList | null = await getSongMetaData(book.id);
    console.log(songs)
    let num_of_songs = Object.entries(songs as any).length;
    Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `${book.id}/songs.json`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book.id}/songs.json`
    })
    
    if(book_summary?.indexAvailable) {
        Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `${book.id}/index.json`,
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
            path: `${book.id}/songs/${song_number}.${ext}`,
            progress: false,
            url: url
        }).then((result) => {
            i++;
            let download_progress = `${i/num_of_songs*100}%`;
            progress_callback(book, i/num_of_songs*100);
            if(i/num_of_songs >= 1) {

                Filesystem.downloadFile({
                    directory: Directory.Documents,
                    path: `${book.id}/summary.json`,
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

async function getBookIndex(book_short_name: string): Promise<BookIndex | null> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchCachedJSON(`${BOOK_METADATA[book_short_name].srcUrl}/index.json`, {});
    }
    return null;
}

export { loadBookSources, download_book, getBookUrls, fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex };
