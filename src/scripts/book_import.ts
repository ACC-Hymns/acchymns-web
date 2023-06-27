import { fetchCachedJSON } from "@/composables/cached_fetch";
import type { BookSummary, SongList, BookIndex } from "@/scripts/types";
import { prepackaged_book_urls } from "@/scripts/constants";
import { Preferences } from "@capacitor/preferences";

async function getBookUrls() {
    const imported_book_urls = await Preferences.get({ key: "externalBooks" });
    return prepackaged_book_urls.concat(JSON.parse(imported_book_urls.value ?? "[]"));
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

async function getSongMetaData(book_short_name: string): Promise<SongList> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return (await fetchCachedJSON(`${BOOK_METADATA[book_short_name].srcUrl}/songs.json`, {})) ?? {};
    }
    return {};
}

async function getBookIndex(book_short_name: string): Promise<BookIndex> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return (await fetchCachedJSON(`${BOOK_METADATA[book_short_name].srcUrl}/index.json`, {})) ?? {};
    }
    return {};
}

export { getBookUrls, fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex };
