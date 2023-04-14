import type { BookSummary, SongList, BookIndex } from "./types";
import { UnknownBookSummary, UnknownSongList } from "./types";
const prepackaged_books = ["ZH", "GH", "JH", "HG"];

async function fetchJSONWithTimeout(resource: RequestInfo | URL, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = 2500 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    }).then((resp) => resp.json());
    clearTimeout(id);
    return response;
}

type CachedResource = {
    time: number; // Received from Date.now()
    data: any;
};

async function fetchJSONCached(url: string, options: RequestInit & { timeout?: number } = {}) {
    const saved_data = localStorage.getItem(`fetchCached.${url}`);
    if (saved_data !== null) {
        const cached = JSON.parse(saved_data) as CachedResource;
        const timeout = 1000 * 60 * 60; // An hour in milliseconds
        if (Date.now() - cached.time < timeout) {
            return cached.data;
        }
    }
    const cached: CachedResource = {
        time: Date.now(),
        data: await fetchJSONWithTimeout(url, options),
    };
    localStorage.setItem(`fetchCached.${url}`, JSON.stringify(cached));
    return cached.data;
}

async function fetchBookSummary(url: string, options: RequestInit & { timeout?: number } = { timeout: 250 }) {
    return await fetchJSONCached(`${url}/summary.json`, options)
        .then((book: BookSummary) => {
            book.addOn = true;
            book.srcUrl = url;
            return book;
        })
        .catch(() => {
            const temp = UnknownBookSummary;
            temp.addOn = true;
            temp.srcUrl = url;
            return temp;
        });
}

async function getAllBookMetaData() {
    const now = performance.now();
    const toFetch: Promise<BookSummary>[] = prepackaged_books.map((book_name) => fetchJSONCached(`books/${book_name}/summary.json`));

    const externalBooksURLs: string[] = JSON.parse(window.localStorage.getItem("externalBooks") ?? "[]");

    for (const url of externalBooksURLs) {
        toFetch.push(fetchBookSummary(url));
    }

    const bookSummary = await Promise.all(toFetch);

    const temp = Object.fromEntries(bookSummary.map((summary, _) => [summary.name.short, summary]));
    console.log("BOOK_METADATA:", performance.now() - now);
    return temp;
}

async function getAllSongMetaData() {
    const now = performance.now();
    const songsToFetch: Promise<SongList>[] = prepackaged_books.map((book_name) => fetchJSONCached(`books/${book_name}/songs.json`));

    const externalBooksURLs: string[] = JSON.parse(window.localStorage.getItem("externalBooks") ?? "[]");

    for (const book_url of externalBooksURLs) {
        songsToFetch.push(fetchJSONCached(`${book_url}/songs.json`).catch(() => UnknownSongList));
    }

    const bookSongs = await Promise.all(songsToFetch);
    const BOOK_METADATA = await getAllBookMetaData();
    const temp = Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
    console.log("SONG_METADATA:", performance.now() - now);
    return temp;
}

async function getSongMetaData(book_short_name: string): Promise<SongList> {
    if (prepackaged_books.includes(book_short_name)) {
        return await fetchJSONCached(`books/${book_short_name}/songs.json`);
    }

    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] === undefined) {
        return UnknownSongList;
    }
    return await fetchJSONCached(`${BOOK_METADATA[book_short_name].srcUrl}/songs.json`).catch(() => UnknownSongList);
}

async function getBookIndex(book_short_name: string): Promise<BookIndex | undefined> {
    if (prepackaged_books.includes(book_short_name)) {
        return await fetchJSONCached(`books/${book_short_name}/index.json`).catch(() => undefined);
    }
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] === undefined) {
        return undefined;
    }
    return await fetchJSONCached(`${BOOK_METADATA[book_short_name].srcUrl}/index.json`).catch(() => undefined);
}

export { fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex, fetchJSONWithTimeout };
