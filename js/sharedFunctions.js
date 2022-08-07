import { SONG_BOOKS } from "./books.js";

function loadSong(songNumber, bookShort) {
    const songView = document.getElementById('songview');
    songView.classList.remove('hidden');
    const searchContent = document.getElementById('content');
    searchContent.classList.add('hidden');

    const songViewTitle = document.getElementById('titlenumber');
    songViewTitle.innerHTML = "";
    const textNode = document.createTextNode(`#${songNumber}`);
    songViewTitle.appendChild(textNode);
    
    const songViewImage = document.getElementById('songimage');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if(window.localStorage.getItem("songInverted") == "true") {
            songViewImage.style.filter = "invert(92%)";
        }
    }
    
    let book = SONG_BOOKS[bookShort]
    let song = book.songs[songNumber];
    let filename = String(songNumber).padStart(Number(book.numberLength), "0") + "." + book.fileExtension;
    songViewImage.setAttribute('src', `./songs/${bookShort}/${filename}`);

    // Set page-global variables TODO: find a better way of doing this
    songNum = songNumber;
    songTitle = song.title;
}

function addSongs(bookShort) {
    let btns = ""
    let numOfSongsInBook = Object.keys(SONG_BOOKS[bookShort].songs).length // Change later to just a length check?
    for(let songNum = 1; songNum <= numOfSongsInBook; songNum++) {
        btns += `
        <a onclick="loadSong(${songNum}, '${bookShort}')">
            <div class="song-btn">
            ${songNum}
            </div>
        </a>
        `;
    }
    const songList = document.getElementById("songs");
    songList.innerHTML = btns
}

window.loadSong = loadSong;

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