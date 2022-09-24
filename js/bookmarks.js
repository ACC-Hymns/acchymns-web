import { SONG_BOOKS } from "/books/index.js";

const bookmarksList = document.getElementById('bookmarksList');
const searchBar = document.getElementById('searchBar');
let bookmarks = [];

searchBar.addEventListener('keyup', (e) => {
    if (bookmarks == null || bookmarks.length == 0){
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
            const book = SONG_BOOKS[song.book];
            return `
            <a href="bookmarks.html?book=${song.book}&song=${song.song}">
                <div class="book" style="background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})">
                    <div>
                        <div class="song__title">${book.songs[song.song].title}</div>
                        <div class="book__title">${book.name.medium}</div>
                    </div>
                    <div class="booktext--right">
                        <div class="song__number">#${song.song}</div>
                        <ion-icon name="ellipsis-vertical"></ion-icon>
                    </div>
                </div>
            </a>
            `;
        })
        .join('');
};

const loadBookmarkSongs = async () => {
    bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    displaySongList(bookmarks, bookmarksList);
};

loadBookmarkSongs();