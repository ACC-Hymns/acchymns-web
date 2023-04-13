function addSongs(bookShort, BOOK_METADATA) {
    let btns = "";
    for(let songNum = 1; songNum <= BOOK_METADATA[bookShort].numOfSongs; songNum++) {
        btns += `<a href="selection.html?book=${bookShort}&song=${songNum}" class="song-btn">${songNum}</a>`;
    }
    document.getElementById("songs").innerHTML = btns;
}

function getSongSrc(bookShort, songNum, BOOK_METADATA){
    let fileName = songNum.padStart(3, "0") + "." + BOOK_METADATA[bookShort].fileExtension
    if(BOOK_METADATA[bookShort].addOn){
        return `${BOOK_METADATA[bookShort].sourceRoot}/songs/${fileName}`;
    }
        
    return `books/${bookShort}/songs/${fileName}`;
}

export {
    addSongs,
    getSongSrc
};