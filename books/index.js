const prepackaged_books = ["ZH", "GH", "JH", "HG", "HZ", "PC", "ZG"];

async function getAllBookMetaData() {
    let toFetch = prepackaged_books.map(book_name => fetch(`/books/${book_name}/summary.json`).then(resp => resp.json()));
    
    let externalBooks = window.localStorage.getItem("externalBooks");
    
    if (externalBooks != null) {
        externalBooks = JSON.parse(externalBooks);
        for (let book_url of externalBooks) {
            toFetch.push(fetch(`${book_url}/summary.json`).then(resp => resp.json()).then(resp => { 
                resp.addOn = true;
                resp.sourceRoot = book_url;
                return resp;
            }).catch(() => null));
        }
    }
    
    const bookSummary = await Promise.all(toFetch);

    return Object.fromEntries(bookSummary.filter(e => e != null).map((summary, _) => [summary.name.short, summary]));
}

async function getAllSongMetaData() {
    let songsToFetch = prepackaged_books.map(book_name => fetch(`/books/${book_name}/songs.json`).then(resp => resp.json()).catch(() => null));
    
    let externalBooks = window.localStorage.getItem("externalBooks");
    
    if (externalBooks != null) {
        externalBooks = JSON.parse(externalBooks);
        for (let book_url of externalBooks) {
            songsToFetch.push(fetch(`${book_url}/songs.json`).then(resp => resp.json()).catch(() => null))
        }
    }
    
    const bookSongs = await Promise.all(songsToFetch);
    const BOOK_METADATA = await getAllBookMetaData();
    
    return Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
}

async function getSongMetaData(book_short_name) {
    if (prepackaged_books.includes(book_short_name)){
        return await fetch(`/books/${book_short_name}/songs.json`).then(resp => resp.json()).catch(() => null);
    }

    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] == null){
        return null;
    }
    return await fetch(`${BOOK_METADATA[book_short_name].sourceRoot}/songs.json`).then(resp => resp.json()).catch(() => null);
}

async function getBookIndex(book_short_name) {
    if (prepackaged_books.includes(book_short_name)){
        return await fetch(`/books/${book_short_name}/index.json`).then(resp => resp.json()).catch(() => null);
    }

    const BOOK_METADATA = await getAllBookMetaData();
    if (BOOK_METADATA[book_short_name] == null){
        return null;
    }
    return await fetch(`${BOOK_METADATA[book_short_name].sourceRoot}/index.json`).then(resp => resp.json()).catch(() => null);
}

const isWebApp = true;

export {
    getAllBookMetaData,
    getAllSongMetaData,
    getSongMetaData,
    getBookIndex,
    isWebApp
}