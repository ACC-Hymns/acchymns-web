import { filter, displaySongList } from "/js/search-tools.js";

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