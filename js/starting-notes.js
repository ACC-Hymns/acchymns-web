const startingNotesButton = document.getElementById('startingNotesButton');
const startingNotesIcon = document.getElementById('startingNotesIcon');
const urlParams = new URLSearchParams(window.location.search);
const bookName = urlParams.get("book");
const songNum = urlParams.get("song");

import { getSongMetaData } from "/books/index.js"

let book_song_metadata = null;
if (bookName != null && songNum != null){
    (async () => {
        book_song_metadata = await getSongMetaData(bookName);
        if (book_song_metadata[songNum]["notes"] != null){
            startingNotesIcon.classList.remove('hidden');
        }
    })();
}

const sampler = new Tone.Sampler({
	urls: {
		"C4": "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		"A4": "A4.mp3",
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();


startingNotesButton.addEventListener('mousedown', (e) => {
    startingNotesIcon.setAttribute('src', "/assets/musical-notes.svg");
    if (book_song_metadata != null && book_song_metadata[songNum]["notes"] != null) {
        if(window.localStorage.getItem("staggered") == "true") {
            for(var i = (book_song_metadata[songNum]["notes"].length - 1); i >= 0; i--) {
                sampler.triggerAttack(book_song_metadata[songNum]["notes"][i], Tone.now() + (0.25 * (book_song_metadata[songNum]["notes"].length - i)));
            }
        } else {
            sampler.triggerAttack(book_song_metadata[songNum]["notes"], Tone.now());
        }
    }
});

startingNotesButton.addEventListener('mouseup', (e) => {
    startingNotesIcon.setAttribute('src', "/assets/musical-notes-outline.svg");
    if (book_song_metadata != null && book_song_metadata[songNum]["notes"] != null) {
        sampler.triggerRelease(book_song_metadata[songNum]["notes"], Tone.now() +3);
    }
});

startingNotesButton.addEventListener('mouseleave', (e) => {
    startingNotesIcon.setAttribute('src', "/assets/musical-notes-outline.svg");
    if (book_song_metadata != null && book_song_metadata[songNum]["notes"] != null) {
        sampler.triggerRelease(book_song_metadata[songNum]["notes"], Tone.now() + 3);
    }
});