const songView = document.getElementById('songview');
const searchContent = document.getElementById('content');
const backButton = document.getElementById('backButton');
const songViewImage = document.getElementById('songimage');

const notesButton = document.getElementById('notesButton');
const bookmarkButton = document.getElementById('bookmarkButton');
const bookmarkIcon = document.getElementById('bookmarkIcon');

function ToggleSongInverted(element){
    console.log(element.checked);
    storage.setItem("songInverted", element.checked);
}

backButton.addEventListener('click', () => {
    searchContent.classList.remove('hidden');
    songView.classList.add('hidden');
    if(bookmarksList != null) {
        loadBookmarkCharacters();
    }
    if(scrollPos != null) {
        window.scrollTo(0, scrollPos);
    }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    if(newColorScheme == "dark")
        songViewImage.style.filter = "invert(92%)";
    else
        songViewImage.style.filter = "invert(0%)";
});
