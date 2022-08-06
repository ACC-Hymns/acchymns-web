import { getSongData } from "./zh.js";

function getFullBook(bookShort) {
    switch(bookShort) {
        case "ZH":
            return "Zion's Harp";
        case "GH":
            return "Gospel Hymns";
        case "HG":
            return "Higher Ground";
        case "JH":
            return "Junior Hymnal";
    }
}

function getClassFromBook(bookShort) {
    switch (bookShort) {
        case "ZH":
            return "book-zionsharp";
        case "GH":
            return "book-gospelhymns";
        case "HG":
            return "book-higherground";
        case "JH":
            return "book-juniorhymnal";
    }
}

const songView = document.getElementById('songview');
const searchContent = document.getElementById('content');
const backButton = document.getElementById('backButton');
const songViewTitle = document.getElementById('titlenumber');
const songViewImage = document.getElementById('songimage');

function loadSong(songNumber, bookShort) {
    searchContent.classList.add('hidden');
    songView.classList.remove('hidden');
    songViewTitle.innerHTML = "";
    const textNode = document.createTextNode(`#${songNumber}`);
    songViewTitle.appendChild(textNode);

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if(window.localStorage.getItem("songInverted") == "true") {
            console.log("should be inverted");
            songViewImage.style.filter = "invert(92%)";
        }
    }

    const bookMetaData = getSongData();
    let book = bookMetaData[bookShort]
    let song = book.songs[songNumber];
    let filename = String(songNumber).padStart(Number(book.numberLength), "0") + "." + book.fileExtension;
    songViewImage.setAttribute('src', `./songs/${bookShort}/${filename}`);

    // Set page-global variables TODO: find a better way of doing this
    songNum = songNumber;
    songTitle = song.title;
}

function addSongs(bookShort) {
    const currentDiv = document.getElementById("songs");
    let numOfSongsInBook = Object.keys(getSongData()[bookShort].songs).length // Change later to just a length check?
    for(let songNum = 1; songNum <= numOfSongsInBook; songNum++) {
        const newButton = document.createElement("a");
        newButton.addEventListener('click', (e) => loadSong(songNum, bookShort));
        
        const newDiv = document.createElement("div");
        newDiv.classList.add("song-btn");
        
        const newContent = document.createTextNode(`${songNum}`);

        newDiv.appendChild(newContent);
        
        newButton.appendChild(newDiv);

        currentDiv.appendChild(newButton);
    }
}

export {
    getFullBook,
    getClassFromBook,
    loadSong,
    addSongs
};