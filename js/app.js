import "./sharedFunctions.js";

const charactersList = document.getElementById('charactersList');
const searchBar = document.getElementById('searchBar');
let songs = [];

backButton.addEventListener('click', () => {
    searchContent.classList.remove('hidden');
    songView.classList.add('hidden');
});

searchBar.addEventListener('keyup', (e) => {
    if (e.key === "Enter") {
        searchBar.blur();
        return;
    }

    const searchString = e.target.value.toLowerCase();

    if (!searchString) {
        displaySearchCharacters([]);
        return;
    }

    let filteredSongs = songs.filter(song => {
        return song.title.toLowerCase().includes(searchString) ||
            song.number.toLowerCase().includes(searchString);
    });

    displaySearchCharacters(filteredSongs);
});
 
const loadCharacters = async () => {
    let bookData = getSongData();

    for (const [bookName, book] of Object.entries(bookData)) {
        for (const [songNum, song] of Object.entries(book.songs)) {
            songs.push({
                title: song.title,
                bookShort: bookName,
                number: songNum
            })
        }
    }
};

function getClassFromBook(bookShort) {
    switch (bookShort) {
        case "ZH":
            return "book-zionsharp";
        case "GH":
            return "book-gospelhymns";
        case "HG":
            return "book-higherground";
        case "JH":
            return "book-juniorhymnal";
    }
}

const displaySearchCharacters = (characters) => {
    characters.sort((a, b) => a.title.localeCompare(b.title));
    const htmlString = characters
        .map((character) => {
            return `
            <a onclick="loadSong(${character.number}, '${character.bookShort}')">
                <div class="${getClassFromBook(character.bookShort)}">
                    <div class="book-gospelhymns--left">
                        <div class="song__title">${character.title}</div>
                        <div class="book__title">${getFullBook(character.bookShort)}</div>
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
    charactersList.innerHTML = htmlString;
};

loadCharacters();