import { getClassFromBook, getFullBook } from "./sharedFunctions.js";
import { getSongData } from "./zh.js";

const songList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');
let songs = [];

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();

    if(!searchString) { // No search term
        displaySongList(songs, songList);
        return;
    }

    let filteredSongs = songs.filter(song => {
        return song.title.toLowerCase().includes(searchString) ||
        song.number.toLowerCase().includes(searchString);
    });
    return displaySongList(filteredSongs, songList); 
});

const displaySongList = (songs, listContainer) => {
    if (listContainer == null){
        return;
    }
    songs.sort((a, b) => a.title.localeCompare(b.title));
    listContainer.innerHTML = songs
        .map(song => {
            return `
            <a onclick="loadSong(${song.number}, '${song.bookShort}')">
                <div class="${getClassFromBook(song.bookShort)}">
                    <div class="book-gospelhymns--left">
                        <div class="song__title">${song.title}</div>
                        <div class="book__title">${getFullBook(song.bookShort)}</div>
                    </div>
                    <div class="booktext--right">
                        <div class="song__number">#${song.number}</div>
                        <ion-icon name="ellipsis-vertical"></ion-icon>
                    </div>
                </div>
            </a>
            `;
        })
        .join('');
};

const loadCharacters = async () => {
    let bookData = getSongData();

    for (const [bookName, book] of Object.entries(bookData)) {
        for (const [songNum, song] of Object.entries(book.songs)) {
            songs.push({
                title: song.title,
                bookShort: bookName,
                number: songNum
            })
        }
    }
    displaySongList([], songList)
};

loadCharacters();