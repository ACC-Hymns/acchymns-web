async function getBookMetaData() {
    let toFetch = [
        fetch("/books/ZH/summary.json").then(resp => resp.json()),
        fetch("/books/GH/summary.json").then(resp => resp.json()),
        fetch("/books/JH/summary.json").then(resp => resp.json()),
        fetch("/books/HG/summary.json").then(resp => resp.json()),
        fetch("/books/HZ/summary.json").then(resp => resp.json()),
        fetch("/books/PC/summary.json").then(resp => resp.json()),
        fetch("/books/ZG/summary.json").then(resp => resp.json())
    ];
    
    let externalBooks = window.localStorage.getItem("externalBooks");
    
    if (externalBooks != null) {
        externalBooks = JSON.parse(externalBooks);
        for (let book_url of externalBooks) {
            toFetch.push(fetch(`${book_url}/summary.json`).then(resp => resp.json()).then(resp => { 
                resp.addOn = true;
                resp.sourceRoot = book_url;
                return resp;
            }));
        }
    }
    
    const bookSummary = await Promise.all(toFetch);

    return Object.fromEntries(bookSummary.map((summary, i) => [summary.name.short, summary]));
}

async function getSongMetaData() {
    let songsToFetch = [
        fetch("/books/ZH/songs.json").then(resp => resp.json()),
        fetch("/books/GH/songs.json").then(resp => resp.json()),
        fetch("/books/JH/songs.json").then(resp => resp.json()),
        fetch("/books/HG/songs.json").then(resp => resp.json()),
        fetch("/books/HZ/songs.json").then(resp => resp.json()),
        fetch("/books/PC/songs.json").then(resp => resp.json()),
        fetch("/books/ZG/songs.json").then(resp => resp.json())
    ];
    
    let externalBooks = window.localStorage.getItem("externalBooks");
    
    if (externalBooks != null) {
        externalBooks = JSON.parse(externalBooks);
        for (let book_url of externalBooks) {
            songsToFetch.push(fetch(`${book_url}/songs.json`).then(resp => resp.json()))
        }
    }
    
    const bookSongs = await Promise.all(songsToFetch);
    const BOOK_METADATA = await getBookMetaData();
    
    return Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
}

async function getBookSongMetaData(book_short_name) {
    if (book_short_name in ["ZH", "GH", "JH", "HG", "HZ", "PC", "ZG"]){
        return await fetch(`/books/${book_short_name}/songs.json`).then(resp => resp.json());
    }

    const BOOK_METADATA = await getBookMetaData();
    return await fetch(`${BOOK_METADATA[book_short_name].sourceRoot}/songs.json`).then(resp => resp.json());
}

const isWebApp = true;

export {
    getBookMetaData,
    getSongMetaData,
    getBookSongMetaData,
    isWebApp
}