import { SONG_BOOKS } from "../books/index.js";

const songList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');
let songs = [];

searchBar.addEventListener('search', () => filter(""));

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value;

    filter(searchString);
});

function filter(searchString) {
    const input = searchString;
    const url = new URL(window.location);
    url.searchParams.set("search", input);
    window.history.pushState({}, '', url);

    searchString = searchString.toLowerCase();

    if(!searchString) { // No search term
        displaySongList([], songList, "");
        return;
    }

    let filteredSongs = songs.filter(s => {
        var characterStrippedTitle = s.title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");
        var characterStrippedSearchString = searchString.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");

        return characterStrippedTitle.toLowerCase().includes(characterStrippedSearchString) ||
        s.number.toLowerCase().includes(characterStrippedSearchString);
    });
    return displaySongList(filteredSongs, songList, input); 
}

const displaySongList = (songs, listContainer, searchString) => {
    if (listContainer == null){
        return;
    }
    songs.sort((a, b) => a.title.localeCompare(b.title));
    listContainer.innerHTML = songs
        .map(song => {
            const url = new URL(window.location);
            url.searchParams.set("book", song.book.name.short);
            url.searchParams.set("song", song.number);
            url.searchParams.set("search", searchString);
            return `
            <a href="${url}">
                <div class="book" style="background: linear-gradient(135deg, ${song.book.primaryColor}, ${song.book.secondaryColor})">
                    <div>
                        <div class="song__title">${song.title}</div>
                        <div class="book__title">${song.book.name.medium}</div>
                    </div>
                    <div class="booktext--right">
                        <div class="song__number">#${song.number}</div>
                        <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 16px" src="../../assets/ellipsis-vertical.svg">
                    </div>
                </div>
            </a>
            `;
        })
        .join('');
};

const loadSongs = async () => {
    for (const [bookName, book] of Object.entries(SONG_BOOKS)) {
        for (const [songNum, song] of Object.entries(book.songs)) {
            let newSong = {
                title: song.title,
                book: {
                    name: {
                        short: book.name.short,
                        medium: book.name.medium,
                        long: book.name.long
                    },
                    addOn: false,
                    primaryColor: book.primaryColor,
                    secondaryColor: book.secondaryColor,
                    fileExtension: book.fileExtension,
                    numberLength: book.numberLength
                },
                number: songNum
            };
            songs.push(newSong);
        }
    }
    displaySongList([], songList, "")
};

loadSongs();

const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("search");
if(searchQuery != null) {
    filter(searchQuery);
    searchBar.value = searchQuery;
}