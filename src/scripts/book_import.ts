import type { BookSummary, SongList, BookIndex } from "./types";
const prepackaged_books = ["ZH", "GH", "JH", "HG"];
const prepackaged_book_urls: string[] = prepackaged_books.map(book_name => import.meta.env.BASE_URL + "books/" + book_name);

function getBookUrls() {
    return prepackaged_book_urls.concat(JSON.parse(window.localStorage.getItem("externalBooks") ?? "[]"));
}

async function fetchJSONWithTimeout<T>(resource: RequestInfo | URL, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = 2500 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    }).then(resp => resp.json());
    clearTimeout(id);
    return response as T;
}

type CachedResource<T> = {
    time: number; // Received from Date.now()
    data: T;
};

async function fetchJSONCached<T>(url: string, options: RequestInit & { timeout?: number } & { best_attempt?: boolean } = {}) {
    const saved_data = sessionStorage.getItem(`fetchCached.${url}`);
    let cached_data: T | null = null;
    if (saved_data !== null) {
        const cached = JSON.parse(saved_data) as CachedResource<T>;
        cached_data = cached.data;
        const timeout = 1000 * 60 * 60; // An hour in milliseconds
        if (Date.now() - cached.time < timeout) {
            return cached_data;
        }
    }

    try {
        const fetched: CachedResource<T> = {
            time: Date.now(),
            data: await fetchJSONWithTimeout(url, options),
        };
        sessionStorage.setItem(`fetchCached.${url}`, JSON.stringify(fetched));
        return fetched.data;
    } catch (ex: any) {
        const e = ex as DOMException;
        if (e.name != "AbortError") {
            console.log(e);
            throw e;
        }

        // If we want to fail soft, best_attempt should be set, and it will return the last cached value
        const { best_attempt = false } = options;
        if (best_attempt && cached_data != null) {
            return cached_data;
        }
    }

    // Not entirely sure what to return here...
    return null;
}

async function fetchBookSummary(url: string, options: RequestInit & { timeout?: number } = { timeout: 500 }) {
    return await fetchJSONCached<BookSummary>(`${url}/summary.json`, options).then(book => {
        if (book == null) {
            return null;
        }
        book.addOn = !prepackaged_books.includes(book.name.short);
        book.srcUrl = url;
        return book;
    });
}

async function getAllBookMetaData() {
    const now = performance.now();
    const book_urls = getBookUrls();
    const to_fetch = book_urls.map(url => fetchBookSummary(url));

    const bookSummary = await Promise.all(to_fetch);

    const temp = Object.fromEntries(bookSummary.map((summary, _) => [summary.name.short, summary]));
    console.log("BOOK_METADATA:", performance.now() - now);
    return temp;
}

async function getAllSongMetaData() {
    const now = performance.now();
    const book_urls = getBookUrls();
    const to_fetch = book_urls.map(url => fetchJSONCached(`${url}/songs.json`));

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

export { getBookUrls, fetchBookSummary, getAllBookMetaData, getAllSongMetaData, getSongMetaData, getBookIndex, fetchJSONWithTimeout };
