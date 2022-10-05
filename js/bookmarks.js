import { BOOK_METADATA } from "/books/index.js";
import { filter } from "/js/search.js";

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
        displaySongList(bookmarks, bookmarksList);
        return;
    }

    displaySongList(filter(bookmarks, searchString), bookmarksList);
});

const displaySongList = (songs, listContainer) => {
    listContainer.innerHTML = songs
        .map(song => {
            const bookMetaData = BOOK_METADATA[song.book];
            return `
            <a href="bookmarks.html?book=${song.book}&song=${song.song}">
                <div class="book" style="background: linear-gradient(135deg, ${bookMetaData.primaryColor}, ${bookMetaData.secondaryColor})">
                    <div>
                        <div class="song__title">${SONG_METADATA[song.book][song.song].title}</div>
                        <div class="book__title">${bookMetaData.name.medium}</div>
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
    displaySongList(bookmarks, bookmarksList);
};

loadBookmarkSongs();