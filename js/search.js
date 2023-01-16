import { filter, displaySongList } from "./search-tools.js";
import { getAllSongMetaData, getAllBookMetaData } from "/books/index.js"

const songList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');

let BOOK_METADATA = {};
let SONG_METADATA = {};
let songs = [];

const urlParams = new URLSearchParams(window.location.search);
const searchString = urlParams.get("q");
document.getElementById('backButton').href = `${window.location.pathname}?q=${searchString}`

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();
    window.history.replaceState(null, "", `search.html?q=${searchString}`);
    if(!searchString) { // No search term
        displaySongList([], songList, SONG_METADATA, BOOK_METADATA, "");
        return;
    }

    displaySongList(filter(songs, searchString, SONG_METADATA), songList, SONG_METADATA, BOOK_METADATA, searchString);
});

const loadSongs = async () => {
    BOOK_METADATA = await getAllBookMetaData();
    SONG_METADATA = await getAllSongMetaData();
    for (const book of Object.keys(SONG_METADATA)) {
        for (const songNum of Object.keys(SONG_METADATA[book])) {
            songs.push({
                book: book,
                song: songNum
            });
        }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const searchString = urlParams.get("q");
    searchBar.value = searchString;
    if (searchString == null){
        displaySongList([], songList, SONG_METADATA, BOOK_METADATA, "");
    } else {
        displaySongList(filter(songs, searchString, SONG_METADATA), songList, SONG_METADATA, BOOK_METADATA, searchString);
    }
};

loadSongs();