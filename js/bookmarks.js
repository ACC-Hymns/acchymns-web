import { getClassFromBook, getFullBook } from "./helpers.js";

const bookmarksList = document.getElementById('bookmarksList');
const searchBar = document.getElementById('searchBar');
let songs = [];

searchBar.addEventListener('keyup', (e) => {
    if (songs == null || songs.length == 0){
        return;
    }

    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();

    if(!searchString) { // No search term
        displaySongList(songs, bookmarksList);
        return;
    }

    let filteredSongs = songs.filter(song => {
        return song.title.toLowerCase().includes(searchString) ||
        song.number.toLowerCase().includes(searchString);
    });
    return displaySongList(filteredSongs, bookmarksList); 
});

const displaySongList = (songs, listContainer) => {
    if (songs == null || songs.length == 0){
        return;
    }
    listContainer.innerHTML = songs
        .map(song => {
            return `
            <a onclick="bookName='${song.bookShort}';
            let bookmarks = JSON.parse(window.localStorage.getItem('bookmarks'));
            if (bookmarks == null)
                bookmarks = [];
            if(bookmarks.findIndex(bookmark => bookmark.number == ${song.number} && bookmark.bookShort == '${song.bookShort}') != -1) {
                bookmarkIcon.setAttribute('name', 'bookmark');
            } else {
                bookmarkIcon.setAttribute('name', 'bookmark-outline');
            }loadSong(${song.number}, '${song.bookShort}')">
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

const loadBookmarkSongs = async () => {
    songs = JSON.parse(window.localStorage.getItem("bookmarks"));
    displaySongList(songs, bookmarksList);
};

loadBookmarkSongs();