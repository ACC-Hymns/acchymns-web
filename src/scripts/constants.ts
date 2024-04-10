const prepackaged_books = ["ZH", "GH", "JH", "HG"];
const prepackaged_book_urls: string[] = prepackaged_books.map(book_name => import.meta.env.BASE_URL + "books/" + book_name);

const branch: string = import.meta.env.VITE_GIT_BRANCH;

// function calcUrl(book_name: string) {
//     if (import.meta.env.DEV) {
//         return import.meta.env.BASE_URL + "public/books/" + book_name;
//     } else if (import.meta.env.MODE == "production") {
//         return `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/${book_name}`;
//     }
// }

const public_references = {
    CH: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/CH`,
    HSZ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/HSZ`,
    HZ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/HZ`,
    ZG: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZG`,
    ZGE: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZGE`,
    ZHJ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZHJ`,
    ZHSP: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZHSP`,
    ZHG: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZHG`,
    ZHH: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZHH`,
    ZHR: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZHR`,
    HS: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/HS`,
    PC: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/PC`,
} as const;

const known_references = {
    ...public_references,
    ARF: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ARF`,
    ARFR: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ARFR`,
} as const;

export { prepackaged_books, prepackaged_book_urls, public_references, branch, known_references };
