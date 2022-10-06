import { BOOK_METADATA } from "/books/index.js";

const songList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');
var SONG_METADATA = {};
let songs = [];

searchBar.addEventListener('search', () => filter(""));

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

    displaySongList(filter(songs, searchString), songList, SONG_METADATA);
});

function filter(toFilter, searchString) {
    let characterStrippedSearchString = searchString.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");
    let filteredSongs = toFilter.filter(s => {
        let characterStrippedTitle = SONG_METADATA[s.book][s.song].title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");

        return characterStrippedTitle.toLowerCase().includes(characterStrippedSearchString) ||
            s.song.toLowerCase().includes(characterStrippedSearchString);
    });
    return filteredSongs;
}

const displaySongList = (songs, listContainer, metadata) => {
    if (listContainer == null) {
        return;
    }
    songs.sort((a, b) => metadata[a.book][a.song].title.localeCompare(metadata[b.book][b.song].title));
    listContainer.innerHTML = songs
        .map(song => {
            return `
            <a href="${window.location.pathname}?book=${song.book}&song=${song.song}">
                <div class="book" style="background: linear-gradient(135deg, ${BOOK_METADATA[song.book].primaryColor}, ${BOOK_METADATA[song.book].secondaryColor})">
                    <div>
                        <div class="song__title">${SONG_METADATA[song.book][song.song].title}</div>
                        <div class="book__title">${BOOK_METADATA[song.book].name.medium}</div>
                    </div>
                    <div class="booktext--right">
                        <div class="song__number">#${song.song}</div>
                        <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 16px" src="../../assets/ellipsis-vertical.svg">
                    </div>
                </div>
            </a>`;
        })
        .join('');
};

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

export {
    filter,
    displaySongList
}