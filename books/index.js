async function getBookMetaData() {
    const bookSummary = await Promise.all([
        fetch("/books/ZH/summary.json").then(resp => resp.json()),
        fetch("/books/GH/summary.json").then(resp => resp.json()),
        fetch("/books/JH/summary.json").then(resp => resp.json()),
        // Add-on books
        fetch("/books/HG/summary.json").then(resp => resp.json()),
        fetch("/books/HZ/summary.json").then(resp => resp.json()),
        fetch("/books/PC/summary.json").then(resp => resp.json()),
        fetch("/books/ZG/summary.json").then(resp => resp.json()),
        fetch("/books/ARF/summary.json").then(resp => resp.json())
    ]);
    return {
        ZH: bookSummary[0],
        GH: bookSummary[1],
        JH: bookSummary[2],
        HG: bookSummary[3],
        HZ: bookSummary[4],
        ZG: bookSummary[6],
        PC: bookSummary[5],
        ARF: bookSummary[7]
    };
}

async function getSongMetaData() {
    const songs = await Promise.all([
        fetch("/books/ZH/songs.json").then(resp => resp.json()),
        fetch("/books/GH/songs.json").then(resp => resp.json()),
        fetch("/books/JH/songs.json").then(resp => resp.json()),
        // Add-on books
        fetch("/books/HG/songs.json").then(resp => resp.json()),
        fetch("/books/HZ/songs.json").then(resp => resp.json()),
        fetch("/books/PC/songs.json").then(resp => resp.json()),
        fetch("/books/ZG/songs.json").then(resp => resp.json()),
        fetch("/books/ARF/songs.json").then(resp => resp.json())
    ]);
    return {
        ZH: songs[0],
        GH: songs[1],
        JH: songs[2],
        HG: songs[3],
        HZ: songs[4],
        ZG: songs[6],
        PC: songs[5],
        ARF: songs[7]
    };
}

const isWebApp = true;

export {
    getBookMetaData,
    getSongMetaData,
    isWebApp
}