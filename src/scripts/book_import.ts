import type { BookSummary, SongList, BookIndex } from "./types";
const prepackaged_books = ["ZH", "GH", "JH", "HG"];
const prepackaged_book_urls: string[] = prepackaged_books.map((book_name) => import.meta.env.BASE_URL + "books/" + book_name);

function getBookUrls() {
    return prepackaged_book_urls.concat(JSON.parse(window.localStorage.getItem("externalBooks") ?? "[]"));
}

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
    return await fetchJSONCached(`${url}/summary.json`, options).then((book: BookSummary) => {
        book.addOn = !prepackaged_books.includes(book.name.short);
        book.srcUrl = url;
        return book;
    });
}

async function getAllBookMetaData() {
    const now = performance.now();
    const book_urls = getBookUrls();
    const to_fetch = book_urls.map((url) => fetchBookSummary(url));

    const bookSummary = await Promise.all(to_fetch);

    const temp = Object.fromEntries(bookSummary.map((summary, _) => [summary.name.short, summary]));
    console.log("BOOK_METADATA:", performance.now() - now);
    return temp;
}

async function getAllSongMetaData() {
    const now = performance.now();
    const book_urls = getBookUrls();
    const to_fetch = book_urls.map((url) => fetchJSONCached(`${url}/songs.json`));

    const bookSongs = await Promise.all(to_fetch);
    const BOOK_METADATA = await getAllBookMetaData();
    const temp = Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
    console.log("SONG_METADATA:", performance.now() - now);
    return temp;
}

async function getSongMetaData(book_short_name: string): Promise<SongList> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchJSONCached(`${BOOK_METADATA[book_short_name].srcUrl}/songs.json`);
    }
    return {};
}

async function getBookIndex(book_short_name: string): Promise<BookIndex | undefined> {
    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] !== undefined) {
        return await fetchJSONCached(`${BOOK_METADATA[book_short_name].srcUrl}/index.json`);
    }
    return {};
}

export { fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex, fetchJSONWithTimeout };
