import { getAllBookMetaData, getSongMetaData, getBookIndex } from "/books/index.js"

const urlParams = new URLSearchParams(window.location.search);
const bookName = urlParams.get("book");
const songNum = urlParams.get("song");

if (bookName != null && songNum != null){
    displaySong(bookName, songNum);
}


const loadTopicalIndex = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookName = urlParams.get("book");
    const BOOK_METADATA = await getAllBookMetaData();
    const topicalIndexTitle = document.getElementById("topicalIndexTitle");
    topicalIndexTitle.innerText = BOOK_METADATA[bookName].name.medium + " Topical Index";
    const BOOK_SONG_METADATA = await getSongMetaData(bookName);
    const BOOK_INDEX = await getBookIndex(bookName);
    const container = document.getElementById("index");
    let wifiSymbol = `<img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="assets/wifi.svg">`
    
    for (const [index_name, songs] of Object.entries(BOOK_INDEX)) {
        const sub_index_node = document.createElement("h2");
        sub_index_node.innerText = index_name;
        const sub_index_container_node = document.createElement("div");
        container.appendChild(sub_index_node);
        container.appendChild(sub_index_container_node);
        sub_index_container_node.innerHTML = songs
            .map(song_num => {
                return `
                <a href="${window.location.pathname}?book=${bookName}&song=${song_num}">
                    <div class="song" style="background: linear-gradient(135deg, ${BOOK_METADATA[bookName].primaryColor}, ${BOOK_METADATA[bookName].secondaryColor})">
                        <div>
                            <div class="song__title">${BOOK_SONG_METADATA[song_num].title}</div>
                        </div>
                        <div class="booktext--right">
                            <div class="song__number">#${song_num}</div>
                            ${BOOK_METADATA[bookName].addOn ? wifiSymbol : ""}
                            <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 16px" src="../../assets/ellipsis-vertical.svg">
                        </div>
                    </div>
                </a>`;
            })
            .join('');
    }
    
};

loadTopicalIndex();