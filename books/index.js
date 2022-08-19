const songData = await Promise.all([
    fetch("/books/GH/index.json").then(resp => resp.json()),
    fetch("/books/ZH/index.json").then(resp => resp.json()),
    fetch("/books/JH/index.json").then(resp => resp.json()),
    // Add-on books
    fetch("/books/HG/index.json").then(resp => resp.json()),
    fetch("/books/HZ/index.json").then(resp => resp.json()),
    fetch("/books/PC/index.json").then(resp => resp.json()),
    fetch("/books/ZG/index.json").then(resp => resp.json())
]);
const SONG_BOOKS = {
    GH: songData[0],
    ZH: songData[1],
    JH: songData[2],
    HG: songData[3],
    HZ: songData[4],
    PC: songData[5],
    ZG: songData[6]
};

export {
    SONG_BOOKS
}