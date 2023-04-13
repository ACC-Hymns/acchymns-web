import { filter, displaySongList } from "./search-tools.js";
import { getAllSongMetaData, getAllBookMetaData } from "../books/index.js"

const bookmarksList = document.getElementById('bookmarksList');
const searchBar = document.getElementById('searchBar');
const urlParams = new URLSearchParams(window.location.search);
const searchString = urlParams.get("q");
document.getElementById('backButton').href = `${window.location.pathname}?q=${searchString}`

let bookmarks = [];
let BOOK_METADATA = {};
let SONG_METADATA = {};

searchBar.addEventListener('keyup', e => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();
    window.history.replaceState(null, "", `bookmarks.html?q=${searchString}`);
    if(!searchString) { // No search term
        displaySongList(bookmarks, bookmarksList, SONG_METADATA, BOOK_METADATA, "");
        return;
    }

    displaySongList(filter(bookmarks, searchString, SONG_METADATA), bookmarksList, SONG_METADATA, BOOK_METADATA, searchString);
});

const loadBookmarkSongs = async () => {
    BOOK_METADATA = await getAllBookMetaData();
    SONG_METADATA = await getAllSongMetaData();
    bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    if (bookmarks == null) {
        bookmarks = [];
    }
    const urlParams = new URLSearchParams(window.location.search);
    const searchString = urlParams.get("q");
    searchBar.value = searchString;
    if (searchString == "" || searchString == null){
        displaySongList(bookmarks, bookmarksList, SONG_METADATA, BOOK_METADATA, "");
    } else {
        displaySongList(filter(bookmarks, searchString, SONG_METADATA), bookmarksList, SONG_METADATA, BOOK_METADATA, searchString);
    }
};

loadBookmarkSongs();