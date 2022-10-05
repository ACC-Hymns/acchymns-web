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

    if(!searchString) { // No search term
        displaySongList([], bookmarksList);
        return;
    }

    displaySongList(filter(songs, searchString), songList, searchString);
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

const displaySongList = (songs, listContainer, searchString) => {
    if (listContainer == null){
        return;
    }
    songs.sort((a, b) => SONG_METADATA[a.book][a.song].title.localeCompare(SONG_METADATA[b.book][b.song].title));
    listContainer.innerHTML = songs
        .map(song => {
            const url = new URL(window.location);
            // url.searchParams.set("book", song.book.name.short);
            // url.searchParams.set("song", song.number);
            // url.searchParams.set("search", searchString);
            return `
            <a href="${url}">
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
            </a>    
            `;
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
    displaySongList([], songList, "")
};

loadSongs();

export {
    filter
}