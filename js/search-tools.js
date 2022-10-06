import { BOOK_METADATA } from "/books/index.js";

function filter(toFilter, searchString, metadata) {
    let characterStrippedSearchString = searchString.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");
    let filteredSongs = toFilter.filter(s => {
        let characterStrippedTitle = metadata[s.book][s.song].title.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/s{2,}/g, " ");

        return characterStrippedTitle.toLowerCase().includes(characterStrippedSearchString) ||
            s.song.toLowerCase().includes(characterStrippedSearchString);
    });
    return filteredSongs;
}

function displaySongList(songs, listContainer, metadata) {
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
                        <div class="song__title">${metadata[song.book][song.song].title}</div>
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

export {
    filter,
    displaySongList
}