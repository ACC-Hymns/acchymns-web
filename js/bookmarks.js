import { filter, displaySongList } from "/js/search-tools.js";
import { getSongMetaData, getBookMetaData } from "/books/index.js"

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

    if(!searchString) { // No search term
        displaySongList(bookmarks, bookmarksList, SONG_METADATA, BOOK_METADATA);
        console.log(bookmarks);
        return;
    }

    displaySongList(filter(bookmarks, searchString, SONG_METADATA), bookmarksList, SONG_METADATA, BOOK_METADATA);
});

const loadBookmarkSongs = async () => {
    bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    //SONG_METADATA = await getSongMetaData();
    displaySongList(bookmarks, bookmarksList, SONG_METADATA, BOOK_METADATA);
};

loadBookmarkSongs();