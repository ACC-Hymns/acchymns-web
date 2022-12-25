import { filter, displaySongList } from "./search-tools.js";
import { getSongMetaData, getBookMetaData } from "../books/index.js"

const bookmarksList = document.getElementById('bookmarksList');
const searchBar = document.getElementById('searchBar');
let bookmarks = [];

const BOOK_METADATA = await getBookMetaData();
const SONG_METADATA = await getSongMetaData();

searchBar.addEventListener('keyup', e => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();
    window.history.replaceState(null, "", `bookmarks.html?q=${searchString}`);
    if(!searchString) { // No search term
        displaySongList(bookmarks, bookmarksList, SONG_METADATA, BOOK_METADATA);
        return;
    }

    displaySongList(filter(bookmarks, searchString, SONG_METADATA), bookmarksList, SONG_METADATA, BOOK_METADATA);
});

const loadBookmarkSongs = async () => {
    bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    const urlParams = new URLSearchParams(window.location.search);
    const searchString = urlParams.get("q");
    if (searchString == null){
        displaySongList(bookmarks, bookmarksList, SONG_METADATA, BOOK_METADATA);
    } else {
        displaySongList(filter(bookmarks, searchString, SONG_METADATA), bookmarksList, SONG_METADATA, BOOK_METADATA);
    }
};

loadBookmarkSongs();