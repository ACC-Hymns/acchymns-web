import { fetchJSONWithTimeout } from "/books/index.js";

function removeExternalBook(book_url) {
    let externalBooks = window.localStorage.getItem("externalBooks");

    if (externalBooks == null) {
        return;
    }
    externalBooks = JSON.parse(externalBooks);

    externalBooks.splice(externalBooks.indexOf(book_url), 1);

    window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    reloadExternalBooksDisplay();
    loadPreviewBooks();
}

async function reloadExternalBooksDisplay() {
    let imported_books = document.getElementById("imported_books");
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null) {
        return;
    }
    externalBooks = JSON.parse(externalBooks);
    
    imported_books.innerHTML = "";

    await Promise.all(externalBooks.map(book_url => fetchJSONWithTimeout(`${book_url}/summary.json`).then(book => {
        imported_books.innerHTML += `
            <div class="book" style="max-height: 50px; background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})">
                <div>
                    <div class="book_title">${book.name.medium}</div>
                </div>
                <div class="booktext--right">
                    <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/wifi.svg">
                    <button onclick="removeExternalBook('${book_url}')"><img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/close.svg"></button>
                </div>
            </div>`
    }).catch(() => {
        imported_books.innerHTML += `
            <div class="book" style="max-height: 50px; background: linear-gradient(135deg, #000000, #000000)">
                <div>
                    <div class="book_title">Unavailable</div>
                </div>
                <div class="booktext--right">
                    <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/wifi.svg">
                    <button onclick="removeExternalBook('${book_url}')"><img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/close.svg"></button>
                </div>
            </div>`
    })));
}

reloadExternalBooksDisplay()

async function AddImportURL(event){
    event.preventDefault();
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null) {
        externalBooks = "[]";
    }
    externalBooks = JSON.parse(externalBooks);

    externalBooks.push(event.target.elements.import_url.value);

    externalBooks = [...new Set(externalBooks)];

    window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    reloadExternalBooksDisplay();
    return false;
}

//let url_form = document.getElementById("URLForm");
//url_form.addEventListener('submit', AddImportURL);

var branch = "staging";

let known_references = {
    "HZ": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/HZ`,
    "ZG": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZG`,
    "ARF": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARF`,
    "ARFR": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARFR`,
    "PC": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/PC`,
    "ZHJ": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZHJ`
};
function AddBook(input){
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null)
        externalBooks = "[]";
    externalBooks = JSON.parse(externalBooks);

    if (input in known_references) {
        externalBooks.push(known_references[input]);
        externalBooks = [...new Set(externalBooks)];
        window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
        reloadExternalBooksDisplay();
        loadPreviewBooks();
    }

    return false;
}

async function loadPreviewBooks() {
    let imported_books = document.getElementById("import_books_preview");
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null)
        externalBooks = "[]";
    externalBooks = JSON.parse(externalBooks);
    imported_books.innerHTML = "";
    for(let book in known_references) {
        let book_url = known_references[book];
        if(externalBooks.includes(book_url))
            continue;
        let response = await fetchJSONWithTimeout(`${book_url}/summary.json`);
        imported_books.innerHTML += `
        <a onclick="AddBook('${book}')">
            <div class="book" style="max-height: 50px; background: linear-gradient(135deg, ${response.primaryColor}, ${response.secondaryColor})">
                <div>
                    <div class="book_title">${response.name.medium}</div>
                </div>
                <div class="booktext--right">
                    <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/add-circle-outline.svg">
                </div>
            </div>
        </a>`;
    }
}

loadPreviewBooks();
window.removeExternalBook = removeExternalBook;
window.AddBook = AddBook;

//let reference_form = document.getElementById("ReferenceForm");
//reference_form.addEventListener('submit', AddImportReference);

