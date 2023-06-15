const prepackaged_books = ["ZH", "GH", "JH", "HG"];
const prepackaged_book_urls: string[] = prepackaged_books.map(book_name => import.meta.env.BASE_URL + "books/" + book_name);

const branch = "staging";

const public_references = {
    HZ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/HZ`,
    ZG: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZG`,
    PC: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/PC`,
    ZHJ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZHJ`,
} as const;

const known_references = {
    ...public_references,
    ARF: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARF`,
    ARFR: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARFR`,
} as const;

export { prepackaged_books, prepackaged_book_urls, public_references, branch, known_references };
