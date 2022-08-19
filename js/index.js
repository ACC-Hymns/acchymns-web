import { SONG_BOOKS } from "../books/index.js"

const bookContainer = document.getElementById("content")

for (let book of Object.values(SONG_BOOKS)) {
    bookContainer.innerHTML += `
        <a href="selection.html?book=${book.name.short}">
            <div class="book" style="background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})">
                <div class="book_title">${book.name.long}</div>
            </div>
        </a>`
}