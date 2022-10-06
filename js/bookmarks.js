import { BOOK_METADATA } from "/books/index.js";
import { filter, displaySongList } from "/js/search.js";

const bookmarksList = document.getElementById('bookmarksList');
const searchBar = document.getElementById('searchBar');
let bookmarks = [];
var SONG_METADATA = {};

searchBar.addEventListener('keyup', e => {
    if (bookmarks == null || bookmarks.length == 0){
        return;
    }

    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();

    if(!searchString) { // No search term
        displaySongList(bookmarks, bookmarksList, SONG_METADATA);
        return;
    }

    displaySongList(filter(bookmarks, searchString), bookmarksList, SONG_METADATA);
});

const loadBookmarkSongs = async () => {
    bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    const songSummary = await Promise.all([
        fetch("/books/ZH/songs.json").then(resp => resp.json()),
        fetch("/books/GH/songs.json").then(resp => resp.json()),
        fetch("/books/JH/songs.json").then(resp => resp.json()),
        // Add-on books
        fetch("/books/HG/songs.json").then(resp => resp.json()),
        fetch("/books/HZ/songs.json").then(resp => resp.json()),
        fetch("/books/PC/songs.json").then(resp => resp.json()),
        fetch("/books/ZG/songs.json").then(resp => resp.json())
    ]);
    SONG_METADATA = {
        ZH: songSummary[0],
        GH: songSummary[1],
        JH: songSummary[2],
        HG: songSummary[3],
        HZ: songSummary[4],
        PC: songSummary[5],
        ZG: songSummary[6]
    };
    displaySongList(bookmarks, bookmarksList, SONG_METADATA);
};

loadBookmarkSongs();