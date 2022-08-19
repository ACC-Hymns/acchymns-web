import { SONG_BOOKS } from "/books/index.js";

function addSongs(bookShort) {
    let btns = ""
    let numOfSongsInBook = Object.keys(SONG_BOOKS[bookShort].songs).length // Change later to just a length check?
    for(let songNum = 1; songNum <= numOfSongsInBook; songNum++) {
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

// Change image dynamically if dark/light mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const songViewImage = document.getElementById('songimage');
    if(event.matches)
        songViewImage.style.filter = "invert(92%)";
    else
        songViewImage.style.filter = "invert(0%)";
});

export {
    addSongs
};