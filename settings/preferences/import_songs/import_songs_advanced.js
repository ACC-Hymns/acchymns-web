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

let url_form = document.getElementById("URLForm");
url_form.addEventListener('submit', AddImportURL);

var branch = "staging";

let known_references = {
    "HZ": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/HZ`,
    "ZG": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZG`,
    "ARF": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARF`,
    "ARFR": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARFR`,
    "PC": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/PC`,
    "ZHJ": `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZHJ`
};
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
    if(url_value!= "") {
        let externalBooks = window.localStorage.getItem("externalBooks");
        if (externalBooks == null) {
            externalBooks = "[]";
        }
        externalBooks = JSON.parse(externalBooks);
    
        externalBooks.push(url_value);
    
        externalBooks = [...new Set(externalBooks)];
    
        window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    }
}

window.removeExternalBook = removeExternalBook;
document.getElementById('import-button').addEventListener('click', ImportData);


