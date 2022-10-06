import { filter, displaySongList } from "/js/search-tools.js";
import { getSongMetaData, getBookMetaData } from "/books/index.js"

const songList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');

const BOOK_METADATA = await getBookMetaData();
const SONG_METADATA = await getSongMetaData();
let songs = [];

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }

    const searchString = e.target.value.toLowerCase();

    if (!searchString) { // No search term
        displaySongList([], songList, SONG_METADATA);
        return;
    }

    displaySongList(filter(songs, searchString, SONG_METADATA), songList, SONG_METADATA, BOOK_METADATA);
});

const loadSongs = async () => {
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