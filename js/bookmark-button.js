import { getFullBook } from "./helpers.js";

function isBookmarked(number, book) {
    let bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    if(bookmarks == null)
        return false;

    for(let bookmark of bookmarks) {
        if(bookmark.number == number && bookmark.bookShort == book) {
            return true;
        }
    }
    return false;
}

const bookmarkButton = document.getElementById('bookmarkButton');
const bookmarkIcon = document.getElementById('bookmarkIcon');

bookmarkButton.addEventListener('click', (e) => {
    let bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    if (bookmarks == null)
        bookmarks = [];
    let index = bookmarks.findIndex(bookmark => bookmark.number == songNum && bookmark.bookShort == bookName)
    if (index != -1) {
        bookmarks.splice(index, 1);
        bookmarkIcon.setAttribute('name', "bookmark-outline");
    } else {
        bookmarks.push(
            {"number": songNum, "bookShort": bookName, "title": songTitle, "book": getFullBook(bookName)}
        );
        bookmarkIcon.setAttribute('name', "bookmark");
    }
    
    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
});


// Figure out on initialization if bookmarked
if(isBookmarked(songNum, bookName)) {
    bookmarkIcon.setAttribute('name', "bookmark");
} else {
    bookmarkIcon.setAttribute('name', "bookmark-outline");
}