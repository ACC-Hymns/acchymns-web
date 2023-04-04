import type { BookSummary, SongList } from "./types";
import { UnknownBookSummary, UnknownSongList } from "./types";
const prepackaged_books = ["ZH", "GH", "JH", "HG"];

async function fetchJSONWithTimeout(resource, options: RequestInit & { timeout?: number } = {}) {
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

async function fetchBookSummary(url: string, options: RequestInit & { timeout?: number } = { timeout: 250 }) {
    return await fetchJSONWithTimeout(`${url}/summary.json`, options)
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
    const toFetch: Promise<BookSummary>[] = prepackaged_books.map((book_name) =>
        fetchJSONWithTimeout(`/books/${book_name}/summary.json`)
    );

    const externalBooksURLs: string[] = JSON.parse(window.localStorage.getItem("externalBooks") ?? "[]");

    for (const url of externalBooksURLs) {
        toFetch.push(fetchBookSummary(url));
    }

    const bookSummary = await Promise.all(toFetch);

    return Object.fromEntries(bookSummary.map((summary, _) => [summary.name.short, summary]));
}

async function getAllSongMetaData() {
    const songsToFetch: Promise<SongList>[] = prepackaged_books.map((book_name) =>
        fetchJSONWithTimeout(`/books/${book_name}/songs.json`)
    );

    const externalBooksURLs: string[] = JSON.parse(window.localStorage.getItem("externalBooks") ?? "[]");

    for (const book_url of externalBooksURLs) {
        songsToFetch.push(fetchJSONWithTimeout(`${book_url}/songs.json`).catch(() => UnknownSongList));
    }

    const bookSongs = await Promise.all(songsToFetch);
    const BOOK_METADATA = await getAllBookMetaData();

    return Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
}

async function getSongMetaData(book_short_name): Promise<SongList> {
    if (prepackaged_books.includes(book_short_name)) {
        return await fetchJSONWithTimeout(`/books/${book_short_name}/songs.json`);
    }

    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] === undefined) {
        return UnknownSongList;
    }
    return await fetchJSONWithTimeout(`${BOOK_METADATA[book_short_name].srcUrl}/songs.json`).catch(
        () => UnknownSongList
    );
}

// async function getBookIndex(book_short_name) {
//     if (prepackaged_books.includes(book_short_name)) {
//         return await fetchJSONWithTimeout(`/books/${book_short_name}/index.json`).catch(() => null);
//     }

//     const BOOK_METADATA = await getAllBookMetaData();
//     if (BOOK_METADATA[book_short_name] == null) {
//         return null;
//     }
//     return await fetchJSONWithTimeout(`${BOOK_METADATA[book_short_name].srcUrl}/index.json`).catch(() => null);
// }

export {
    fetchBookSummary,
    getAllBookMetaData,
    getAllSongMetaData,
    getSongMetaData,
    // getBookIndex,
    fetchJSONWithTimeout,
};
