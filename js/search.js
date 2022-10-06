import { filter, displaySongList } from "/js/search-tools.js";
import { getSongMetaData } from "/books/index.js"

const songList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');
var SONG_METADATA = {};
let songs = [];

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }

    const searchString = e.target.value.toLowerCase();

    if (!searchString) { // No search term
        displaySongList([], songList, metadata);
        return;
    }

    displaySongList(filter(songs, searchString, SONG_METADATA), songList, SONG_METADATA);
});

const loadSongs = async () => {
    SONG_METADATA = await getSongMetaData();
    for (const book of Object.keys(SONG_METADATA)) {
        for (const songNum of Object.keys(SONG_METADATA[book])) {
            songs.push({
                book: book,
                song: songNum
            });
        }
    }
    displaySongList([], songList, SONG_METADATA);
};

loadSongs();