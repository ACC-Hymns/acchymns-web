function addSongs(bookShort, BOOK_METADATA) {
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

function getSongSrc(bookShort, songNum, BOOK_METADATA){
    let fileName = songNum.padStart(3, "0") + "." + BOOK_METADATA[bookShort].fileExtension
    if(BOOK_METADATA[bookShort].addOn){
        return `${BOOK_METADATA[bookShort].sourceRoot}/songs/${fileName}`;
    }
        
    return `/books/${bookShort}/songs/${fileName}`;
}

export {
    addSongs,
    getSongSrc
};