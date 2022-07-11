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
        if(searchString.length < 2 && isNaN(searchString)) {
            filteredSongs = songs.filter(song => {
                return (song.title.toLowerCase().startsWith(searchString));
            });
            return displaySearchCharacters(filteredSongs);   
        }
        displaySearchCharacters(filteredSongs);
    } else {
        displaySearchCharacters(noSongs);
    }
});

function pad(n, length) {
    var len = length - (''+n).length;
    return (len > 0 ? new Array(++len).join('0') : '') + n
}

const loadCharacters = async () => {
    try {
        songs = getSongData();
    } catch (err) {
        console.error(err);
    }
};

function loadSong(input, songBook) {
    window.scrollTo(0,0);
    
    searchContent.classList.add('hidden');
    songView.classList.remove('hidden');
    songViewTitle.innerHTML = "";
    const textNode = document.createTextNode(`#${input}`);
    songViewTitle.appendChild(textNode);

    const songArray = getSongData();

    for(var i = 0; i < songArray.length; i++) {
        if(songArray[i].number == input && songArray[i].bookShort == songBook)
            songViewImage.setAttribute('src', `./songs/${songArray[i].bookShort}/${songArray[i].filename}`);
        else
            continue;
    }
}

function getClassFromBook(bookShort) {
    switch(bookShort) {
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
    characters.sort((a,b) => a.title.localeCompare(b.title));
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
    charactersList.innerHTML = htmlString;
};

loadCharacters();
