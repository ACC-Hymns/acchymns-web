import { getSongFileName } from "/js/song-loader.js";
import { getBookMetaData } from "/books/index.js";
const BOOK_METADATA = await getBookMetaData();

function displaySong(bookName, songNum) {
    const songView = document.getElementById('songview');
    songView.classList.remove('hidden');
    const searchContent = document.getElementById('content');
    searchContent.classList.add('hidden');

    const songViewTitle = document.getElementById('titlenumber');
    songViewTitle.innerHTML = "";
    const textNode = document.createTextNode(`#${songNum}`);
    songViewTitle.appendChild(textNode);

    // accessing the element
    const songViewImage = document.getElementById('songimage');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if(window.localStorage.getItem("songInverted") == "true") {
            songViewImage.style.filter = "invert(92%)";
        }
    }
    
    let fileName = getSongFileName(bookName, songNum, BOOK_METADATA);
    if(BOOK_METADATA[bookName].addOn){
        songViewImage.setAttribute('src',  BOOK_METADATA[bookName].sourceRoot + fileName);
    } else {
        songViewImage.setAttribute('src', `/books/${bookName}/songs/${fileName}`);
    }
    songViewImage.onerror = () => {
        songViewImage.src = "/assets/wifi_off.svg";
        songViewImage.style.width = "50%";
        songViewImage.style.height = "50%";
    }
}

const urlParams = new URLSearchParams(window.location.search);
const bookName = urlParams.get("book");
const songNum = urlParams.get("song");
if (bookName != null && songNum != null){
    displaySong(bookName, songNum);
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
    displaySong
};