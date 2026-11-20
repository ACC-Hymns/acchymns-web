const prepackaged_books = ["ZH", "GH", "JH"];
const prepackaged_book_urls: string[] = [
    `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZH`,
    `https://raw.githubusercontent.com/ACC-Hymns/books/main/GH`,
    `https://raw.githubusercontent.com/ACC-Hymns/books/main/JH`,
]

const branch: string = import.meta.env.VITE_GIT_BRANCH;

const public_references = {
    HG: `https://raw.githubusercontent.com/ACC-Hymns/books/main/HG`,
    CH: `https://raw.githubusercontent.com/ACC-Hymns/books/main/CH`,
    HZ: `https://raw.githubusercontent.com/ACC-Hymns/books/main/HZ`,
    HSZ: `https://raw.githubusercontent.com/ACC-Hymns/books/main/HSZ`,
    ZG: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZG`,
    XC: `https://raw.githubusercontent.com/ACC-Hymns/books/main/XC`,
    ZGE: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZGE`,
    ZHJ: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZHJ`,
    ZHSP: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZHSP`,
    ZHG: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZHG`,
    BS: `https://raw.githubusercontent.com/ACC-Hymns/books/main/BS`,
    LDH: `https://raw.githubusercontent.com/ACC-Hymns/books/main/LDH`,
    ES: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ES`,
    MO: `https://raw.githubusercontent.com/ACC-Hymns/books/main/MO`,
    ZHH: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZHH`,
    ZHR: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZHR`,
    ZHU: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ZHU`,
    HS: `https://raw.githubusercontent.com/ACC-Hymns/books/main/HS`,
    PC: `https://raw.githubusercontent.com/ACC-Hymns/books/main/PC`,
} as const;

const known_references = {
    ...public_references,
    ARF: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ARF`,
    ARFR: `https://raw.githubusercontent.com/ACC-Hymns/books/main/ARFR`,
} as const;

export { prepackaged_books, prepackaged_book_urls, public_references, branch, known_references };
