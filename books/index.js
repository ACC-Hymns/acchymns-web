const songSummary = await Promise.all([
    fetch("/books/ZH/summary.json").then(resp => resp.json()),
    fetch("/books/GH/summary.json").then(resp => resp.json()),
    fetch("/books/JH/summary.json").then(resp => resp.json()),
    // Add-on books
    fetch("/books/HG/summary.json").then(resp => resp.json()),
    fetch("/books/HZ/summary.json").then(resp => resp.json()),
    fetch("/books/PC/summary.json").then(resp => resp.json()),
    fetch("/books/ZG/summary.json").then(resp => resp.json())
]);

const BOOK_METADATA = {
    ZH: songSummary[0],
    GH: songSummary[1],
    JH: songSummary[2],
    HG: songSummary[3],
    HZ: songSummary[4],
    PC: songSummary[5],
    ZG: songSummary[6]
};

const isWebApp = true;

export {
    BOOK_METADATA,
    isWebApp
}