const SONG_BOOKS = await Promise.all([
    fetch("/books/GH/index.json").then(resp => resp.json()),
    fetch("/books/ZH/index.json").then(resp => resp.json()),
    fetch("/books/JH/index.json").then(resp => resp.json()),
    // Add-on books
    fetch("/books/HG/index.json").then(resp => resp.json()),
    fetch("/books/HZ/index.json").then(resp => resp.json()),
    fetch("/books/PC/index.json").then(resp => resp.json()),
    fetch("/books/ZG/index.json").then(resp => resp.json())
]);

export {
    SONG_BOOKS
}