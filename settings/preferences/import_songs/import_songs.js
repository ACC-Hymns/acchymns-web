function removeExternalBook(book_index) {
    console.log("removing index", book_index)
    let externalBooks = window.localStorage.getItem("externalBooks");

    if (externalBooks == null) {
        return;
    }
    externalBooks = JSON.parse(externalBooks);

    externalBooks.splice(book_index, 1);

    window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    reloadExternalBooksDisplay();
}

async function reloadExternalBooksDisplay() {
    let imported_books = document.getElementById("imported_books");
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null) {

        return;
    }
    externalBooks = JSON.parse(externalBooks);
    
    imported_books.innerHTML = "";
    for (let book_url of externalBooks) {
        try {
            let book = await fetch(`${book_url}/summary.json`).then(resp => resp.json());
            imported_books.innerHTML += `
                <div class="book" style="background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})">
                    <div>
                        <div class="book_title">${book.name.medium}</div>
                        <div class="book_subtitle">${book_url}</div>
                    </div>
                    <div class="booktext--right">
                        <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/wifi.svg">
                        <button><img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/close.svg"></button>
                    </div>
                </div>`
        } catch {
            imported_books.innerHTML += `
                <div class="book" style="background: linear-gradient(135deg, #000000, #000000)">
                    <div>
                        <div class="book_title">Unavailable</div>
                        <div class="book_subtitle">${book_url}</div>
                    </div>
                    <div class="booktext--right">
                        <img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/wifi.svg">
                        <button><img class="ionicon" style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%); width: 24px" src="/assets/close.svg"></button>
                    </div>
                </div>`
        }
    }

    console.log(imported_books.children)
    for (let [book_index, imported_book_html] of [...imported_books.children].entries()) {
        let bound = removeExternalBook.bind(null, book_index);
        imported_book_html.getElementsByTagName("button")[0].addEventListener("click", (event) => bound());
    }
}

reloadExternalBooksDisplay()

async function AddImportURL(event){
    event.preventDefault();
    console.log("attempt to import")
    let externalBooks = window.localStorage.getItem("externalBooks");
    if (externalBooks == null) {
        externalBooks = [];
    } else {
        externalBooks = JSON.parse(externalBooks);
    }
    externalBooks.push(event.target.elements.import_url.value);
    console.log(externalBooks)
    window.localStorage.setItem("externalBooks", JSON.stringify(externalBooks));
    reloadExternalBooksDisplay();
    return false;
}

let form = document.getElementById("myForm");
form.addEventListener('submit', AddImportURL);

