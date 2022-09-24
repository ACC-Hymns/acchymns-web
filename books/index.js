const webApp = true;

const songData = await Promise.all([
    fetch("/books/ZH/index.json").then(resp => resp.json()),
    fetch("/books/GH/index.json").then(resp => resp.json()),
    fetch("/books/JH/index.json").then(resp => resp.json()),
    // Add-on books
    fetch("/books/HG/index.json").then(resp => resp.json()),
    fetch("/books/HZ/index.json").then(resp => resp.json()),
    fetch("/books/PC/index.json").then(resp => resp.json()),
    fetch("/books/ZG/index.json").then(resp => resp.json())
]);
const SONG_BOOKS = {
    ZH: songData[0],
    GH: songData[1],
    JH: songData[2],
    HG: songData[3],
    HZ: songData[4],
    PC: songData[5],
    ZG: songData[6]
};

function getAllSongs() {
    let songs = [];
    for (const [bookName, book] of Object.entries(SONG_BOOKS)) {
        for (const [songNum, song] of Object.entries(book.songs)) {
            songs.push({
                title: song.title,
                book: {
                    name: {
                        short: book.name.short,
                        medium: book.name.medium,
                        long: book.name.long
                    },
                    addOn: book.addOn,
                    primaryColor: book.primaryColor,
                    secondaryColor: book.secondaryColor,
                    fileExtension: book.fileExtension,
                    numberLength: book.numberLength,
                },
                number: songNum
            })
        }
    }
    console.log(songs);
    return songs;
}

export {
    SONG_BOOKS,
    webApp
}