function filter(toFilter, searchString, SONG_METADATA) {
    let characterStrippedSearchString = searchString.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");
    let filteredSongs = toFilter.filter(s => {
        let bookData = SONG_METADATA[s.book];
        if(bookData == undefined)
            return false;
        let songData = bookData[s.song];
        if(songData == undefined)
            return false;
        let characterStrippedTitle = songData.title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");
        if(!isNaN(characterStrippedSearchString))
            return characterStrippedSearchString == s.song;
        return characterStrippedTitle.toLowerCase().includes(characterStrippedSearchString) ||
            s.song.toLowerCase().includes(characterStrippedSearchString);
    });
    return filteredSongs;
}

function displaySongList(songs, listContainer, SONG_METADATA, BOOK_METADATA, query, sort = true) {
    if (listContainer == null) {
        return;
    }
    if (sort) {
        songs = songs.filter((song) => {
            return BOOK_METADATA[song.book] != undefined;
        })
        songs.sort((a, b) => SONG_METADATA[a.book][a.song].title.localeCompare(SONG_METADATA[b.book][b.song].title));
    }
    let wifiSymbol = `<img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="assets/wifi.svg">`
    listContainer.innerHTML = songs
        .map(song => {
            return `
            <a href="${window.location.pathname}?book=${song.book}&song=${song.song}&q=${query}" class="song" style="background: linear-gradient(135deg, ${BOOK_METADATA[song.book].primaryColor}, ${BOOK_METADATA[song.book].secondaryColor})">
                <div>
                    <div class="song__title">${SONG_METADATA[song.book][song.song].title}</div>
                    <div class="book__title">${BOOK_METADATA[song.book].name.medium}</div>
                </div>
                <div class="booktext--right">
                    <div class="song__number">#${song.song}</div>
                    ${BOOK_METADATA[song.book].addOn ? wifiSymbol : ""}
                </div>
            </a>`;
        })
        .join('');
};

export {
    filter,
    displaySongList
}