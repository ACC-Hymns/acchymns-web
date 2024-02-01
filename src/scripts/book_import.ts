import { fetchCachedJSON } from "@/composables/cached_fetch";
import type { BookSummary, SongList, BookIndex } from "@/scripts/types";
import { branch, prepackaged_book_urls } from "@/scripts/constants";
import { Preferences } from "@capacitor/preferences";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import type { DownloadFileResult, FileInfo } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { loaded } from "tone";

async function getBookUrls() {
    const imported_book_urls = await Preferences.get({ key: "externalBooks" });
    return prepackaged_book_urls.concat(JSON.parse(imported_book_urls.value ?? "[]"));
}

async function download_book(to_download: string) {    
    let url_segments = to_download.split("/");
    let book = url_segments[url_segments.length - 1];

    let book_summary = await fetchBookSummary(`https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book}`)
    let ext = book_summary?.fileExtension;
    let songs: SongList | null = await getSongMetaData(book);
    let num_of_songs = Object.entries(songs as any).length;
    Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `${book}/songs.json`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book}/songs.json`
    })
    Filesystem.downloadFile({
        directory: Directory.Documents,
        path: `${book}/index.json`,
        progress: false,
        url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book}/index.json`
    }).then((result) => {
        console.log(result.path);
    }).catch(err => {
        console.log("Ignored File: " + err);
    });

    var i = 0;
    for(let song_number in songs) {
        let url = `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book}/songs/${song_number}.${ext}`
        Filesystem.downloadFile({
            directory: Directory.Documents,
            path: `${book}/songs/${song_number}.${ext}`,
            progress: false,
            url: url
        }).then((result) => {
            i++;
            let download_progress = `${i/num_of_songs*100}%`;
            console.log(download_progress);
            if(i/num_of_songs >= 1) {

                Filesystem.downloadFile({
                    directory: Directory.Documents,
                    path: `${book}/summary.json`,
                    progress: false,
                    url: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book}/summary.json`
                }).then((new_result: DownloadFileResult) => {
                    console.log(`${book} has finished downloading.`);
                    let summary_path: string = new_result.path || "";
                    summary_path = summary_path.replace("/summary.json", "");

                    // this is used for calling fetch on downloaded books
                    let web_url = Capacitor.convertFileSrc(summary_path);
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

export { getBookUrls, fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex };
