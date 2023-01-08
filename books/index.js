async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 2500 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetchWithTimeout(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  }

async function getBookMetaData() {
    let toFetch = [
        fetchWithTimeout("/books/ZH/summary.json", {timeout}).then(resp => resp.json()),
        fetchWithTimeout("/books/GH/summary.json").then(resp => resp.json()),
        fetchWithTimeout("/books/JH/summary.json").then(resp => resp.json()),
        fetchWithTimeout("/books/HG/summary.json").then(resp => resp.json()),
        fetchWithTimeout("/books/HZ/summary.json").then(resp => resp.json()),
        fetchWithTimeout("/books/PC/summary.json").then(resp => resp.json()),
        fetchWithTimeout("/books/ZG/summary.json").then(resp => resp.json())
    ];
    
    let externalBooks = window.localStorage.getItem("externalBooks");
    
    if (externalBooks != null) {
        externalBooks = JSON.parse(externalBooks);
        for (let book_url of externalBooks) {
            toFetch.push(fetchWithTimeout(`${book_url}/summary.json`).then(resp => resp.json()).then(resp => { 
                resp.addOn = true;
                resp.sourceRoot = book_url;
                return resp;
            }).catch(() => null));
        }
    }
    
    const bookSummary = await Promise.all(toFetch);

    return Object.fromEntries(bookSummary.filter(e => e != null).map((summary, _) => [summary.name.short, summary]));
}

async function getSongMetaData() {
    let songsToFetch = [
        fetchWithTimeout("/books/ZH/songs.json").then(resp => resp.json()),
        fetchWithTimeout("/books/GH/songs.json").then(resp => resp.json()),
        fetchWithTimeout("/books/JH/songs.json").then(resp => resp.json()),
        fetchWithTimeout("/books/HG/songs.json").then(resp => resp.json()),
        fetchWithTimeout("/books/HZ/songs.json").then(resp => resp.json()),
        fetchWithTimeout("/books/PC/songs.json").then(resp => resp.json()),
        fetchWithTimeout("/books/ZG/songs.json").then(resp => resp.json())
    ];
    
    let externalBooks = window.localStorage.getItem("externalBooks");
    
    if (externalBooks != null) {
        externalBooks = JSON.parse(externalBooks);
        for (let book_url of externalBooks) {
            songsToFetch.push(fetchWithTimeout(`${book_url}/songs.json`).then(resp => resp.json()))
        }
    }
    
    const bookSongs = await Promise.all(songsToFetch);
    const BOOK_METADATA = await getBookMetaData();
    
    return Object.fromEntries(Object.keys(BOOK_METADATA).map((book_name, i) => [book_name, bookSongs[i]]));
}

const isWebApp = true;

export {
    getBookMetaData,
    getSongMetaData,
    fetchWithTimeout,
    isWebApp
}