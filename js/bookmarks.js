const searchBar = document.getElementById('searchBar');
let songs = [];

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }
    const searchString = e.target.value.toLowerCase();
    let filteredSongs;
    if(!isNaN(searchString)) {
        filteredSongs = songs.filter( song => {
            return (song.number == searchString);
        });
    }
    else {
        filteredSongs = songs.filter( song => {
            return ( song.title.toLowerCase().includes(searchString) ||
            song.number.toLowerCase().includes(searchString) );
        });
    }
    const noSongs = songs.filter( song => {
        return ( song.title.toLowerCase().includes("asjfnnwfenow3w") ||
        song.number.toLowerCase().includes("asjfnnwfenow3w") );
    });
    if(!!searchString) {
        if(searchString.length < 2 && isNaN(searchString))
            filteredSongs = songs.filter(song => {
                return (song.title.toLowerCase().startsWith(searchString));
            });
            return displaySearchCharacters(filteredSongs); 
    } else {
        displaySearchCharacters(songs);
    }
});

const displaySearchCharacters = (characters) => {
    const htmlString = characters
        .map((character) => {
            return `
            <a onclick="loadSong(${character.number}, '${character.bookShort}')">
                <div class="${getClassFromBook(character.bookShort)}">
                    <div class="book-gospelhymns--left">
                        <div class="song__title">${character.title}</div>
                        <div class="book__title">${character.book}</div>
                    </div>
                    <div class="booktext--right">
                        <div class="song__number">#${character.number}</div>
                        <ion-icon name="ellipsis-vertical"></ion-icon>
                    </div>
                </div>
            </a>
            `;
        })
        .join('');
    bookmarksList.innerHTML = htmlString;
};

const loadBookmarkCharacters = async () => {
    try {
        songs = JSON.parse(storage.getItem("bookmarks"));
        displayCharacters(songs);
    } catch (err) {
        console.error(err);
    }
};


loadBookmarkCharacters();