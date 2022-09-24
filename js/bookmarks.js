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
        displaySongList(bookmarks, bookmarksList);
        return;
    }

    const filteredSongs = bookmarks.filter(s => {
        const book = SONG_BOOKS[s.book];
        const song = book.songs[s.song];
        var characterStrippedTitle = song.title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");
        var characterStrippedSearchString = searchString.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");

        return characterStrippedTitle.toLowerCase().includes(characterStrippedSearchString) ||
        s.song.toLowerCase().includes(characterStrippedSearchString);
    });
    displaySongList(filteredSongs, bookmarksList);
    return;
});

const displaySongList = (songs, listContainer) => {

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
                        <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 16px" src="../../assets/ellipsis-vertical.svg">
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