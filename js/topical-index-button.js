import { getBookIndex } from "/books/index.js";

const topicalIndexButton = document.getElementById('topicalIndexButton');
const topicalIndexIcon = document.getElementById('topicalIndexIcon');
topicalIndexButton.href = `topical-index.html${window.location.search}`;

(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookName = urlParams.get("book");
    if (await getBookIndex(bookName) != null) {
        topicalIndexIcon.classList.remove("hidden");
    }
})();
