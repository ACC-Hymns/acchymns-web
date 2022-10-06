import { filter, displaySongList } from "/js/search-tools.js";
import { getSongMetaData } from "/books/index.js"

const bookmarksList = document.getElementById('bookmarksList');
const searchBar = document.getElementById('searchBar');
let bookmarks = [];
var SONG_METADATA = {};

searchBar.addEventListener('keyup', e => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();

    if(!searchString) { // No search term
        displaySongList(bookmarks, bookmarksList, SONG_METADATA);
        return;
    }

    displaySongList(filter(bookmarks, searchString, SONG_METADATA), bookmarksList, SONG_METADATA);
});

const loadBookmarkSongs = async () => {
    bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    SONG_METADATA = await getSongMetaData();
    displaySongList(bookmarks, bookmarksList, SONG_METADATA);
};

loadBookmarkSongs();