const prepackaged_books = ["ZH", "GH", "JH", "HG"] as const;
const prepackaged_book_urls: string[] = prepackaged_books.map(book_name => import.meta.env.BASE_URL + "books/" + book_name);

const branch: string = import.meta.env.VITE_GIT_BRANCH;

const public_references = {
    HZ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/HZ`,
    ZG: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZG`,
    PC: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/PC`,
    ZHJ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ZHJ`,
} as const;

const known_references = {
    ...public_references,
    ARF: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ARF`,
    ARFR: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/books/ARFR`,
} as const;

export { prepackaged_books, prepackaged_book_urls, public_references, branch, known_references };
