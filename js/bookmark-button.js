const bookmarkButton = document.getElementById('bookmarkButton');
const bookmarkIcon = document.getElementById('bookmarkIcon');
const urlParams = new URLSearchParams(window.location.search);
const bookName = urlParams.get("book");
const songNum = urlParams.get("song");

bookmarkButton.addEventListener('click', (e) => {
    let bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    if (bookmarks == null)
        bookmarks = [];
    let index = bookmarks.findIndex(bookmark => bookmark.book == bookName && bookmark.song == songNum);
    if (index != -1) {
        bookmarks.splice(index, 1);
        bookmarkIcon.setAttribute('src', "assets/bookmark-outline.svg");
    } else {
        bookmarks.push({"book": bookName, "song": songNum});
        bookmarkIcon.setAttribute('src', "assets/bookmark.svg");
    }
    
    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
});

function getBookmarkIndex(number, book) {
    let bookmarks = JSON.parse(window.localStorage.getItem("bookmarks"));
    if(bookmarks == null)
        return -1;
    return bookmarks.findIndex(bookmark => bookmark.book == book && bookmark.song == number);
}

// Figure out on initialization if bookmarked
if(getBookmarkIndex(songNum, bookName) != -1) {
    bookmarkIcon.setAttribute('src', "assets/bookmark.svg");
} else {
    bookmarkIcon.setAttribute('src', "assets/bookmark-outline.svg");
}