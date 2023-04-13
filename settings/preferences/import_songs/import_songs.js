import { fetchJSONWithTimeout } from "../../../books/index.js";

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

let url_form = document.getElementById("URLForm");
url_form.addEventListener('submit', AddImportURL);

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
                    <div class="book_title_small">${book.name.medium}</div>
                </div>
                <div class="booktext--right" style="float: right; display: inline-block;">
                    <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/wifi.svg">
                    <button onclick="removeExternalBook('${book_url}')"><img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/close.svg"></button>
                </div>
            </div>`
    }).catch(() => {
        imported_books.innerHTML += `
            <div class="book" style="max-height: 50px; background: linear-gradient(135deg, #000000, #000000)">
                <div>
                    <div class="book_title_small">Unavailable</div>
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
    loadPreviewBooks();
    return false;
}

let branch = "dallas/try-pdf";

let visible_references = {
    "HZ": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/HZ`,
    "ZG": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZG`,
    "PC": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/PC`,
    "ZHJ": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZHJ`
};

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

async function AddImportReference(event){
    event.preventDefault();
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null) {
        externalBooks = "[]";
    }
    externalBooks = JSON.parse(externalBooks);

    if (event.target.elements.import_reference.value in known_references) {
        externalBooks.push(known_references[event.target.elements.import_reference.value]);
        externalBooks = [...new Set(externalBooks)];
        window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    }
    reloadExternalBooksDisplay();
    loadPreviewBooks();
    return false;
}

let reference_form = document.getElementById("ReferenceForm");
reference_form.addEventListener('submit', AddImportReference);


function ImportData() {
    var reference_value = reference_form.elements.import_reference.value;
    var url_value = url_form.elements.import_url.value;
    if(reference_value != "") {
        let externalBooks = window.localStorage.getItem("externalBooks");
        if (externalBooks == null) {
            externalBooks = "[]";
        }
        externalBooks = JSON.parse(externalBooks);
    
        if (reference_value in known_references) {
            externalBooks.push(known_references[reference_value]);
            externalBooks = [...new Set(externalBooks)];
            window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
        }
    }
    if(url_value != "") {
        let externalBooks = window.localStorage.getItem("externalBooks");
        if (externalBooks == null) {
            externalBooks = "[]";
        }
        externalBooks = JSON.parse(externalBooks);
    
        for(var url in known_references){
            if(url_value != url)
                return;
        }
        externalBooks.push(url_value);
    
        externalBooks = [...new Set(externalBooks)];
    
        window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    }
    reloadExternalBooksDisplay();
    loadPreviewBooks();
}

document.getElementById('import-button').addEventListener('click', ImportData);


async function loadPreviewBooks() {
    let imported_books = document.getElementById("import_books_preview");
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null)
        externalBooks = "[]";
    externalBooks = JSON.parse(externalBooks);
    imported_books.innerHTML = "";
    for(let book in visible_references) {
        let book_url = visible_references[book];
        if(externalBooks.includes(book_url))
            continue;
        let response = await fetchJSONWithTimeout(`${book_url}/summary.json`);
        imported_books.innerHTML += `
        <a onclick="AddBook('${book}')">
            <div class="book" style="max-height: 50px; background: linear-gradient(135deg, ${response.primaryColor}, ${response.secondaryColor})">
                <div>
                    <div class="book_title_small">${response.name.medium}</div>
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