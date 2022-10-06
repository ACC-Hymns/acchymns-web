import { BOOK_METADATA } from "/books/index.js";

function addSongs(bookShort) {
    let btns = ""
    let songNums = Array.from({length: BOOK_METADATA[bookShort].numOfSongs}, (_, i) => i + 1).filter(x => !BOOK_METADATA[bookShort].missingSongs.includes(x));

    for(let songNum of songNums) {
        btns += `
            <a href="selection.html?book=${bookShort}&song=${songNum}">
                <div class="song-btn">
                ${songNum}
                </div>
            </a>`;
    }
    const songList = document.getElementById("songs");
    songList.innerHTML = btns
}

function getSongFileName(bookShort, songNum){
    // BOOK_METADATA[bookShort].numOfSongsInBook.toString().length
    return songNum.padStart(3, "0") + "." + BOOK_METADATA[bookShort].fileExtension;
}

async function getBookSongs(bookShort) {
    return await fetch(`/books/${bookShort}/songs.json`).then(resp => resp.json());
}


export {
    addSongs,
    getSongFileName,
    getBookSongs
};