const startingNotesButton = document.getElementById("startingNotesButton");
const startingNotesIcon = document.getElementById("startingNotesIcon");
const urlParams = new URLSearchParams(window.location.search);
const bookName = urlParams.get("book");
const songNum = urlParams.get("song");

import * as Tone from "tone";

import { getSongMetaData } from "./book_import";

let book_song_metadata = null;
if (bookName != null && songNum != null) {
    (async () => {
        book_song_metadata = await getSongMetaData(bookName);
        if (book_song_metadata[songNum]["notes"] != null) {
            startingNotesIcon.classList.remove("hidden");
        }
    })();
}

const sampler = new Tone.Sampler({
    urls: {
        A2: "/assets/notes/A2.mp3",
        C3: "/assets/notes/C3.mp3",
        A3: "/assets/notes/A3.mp3",
        C4: "/assets/notes/C4.mp3",
        A4: "/assets/notes/A4.mp3",
        C5: "/assets/notes/C5.mp3",
    },
}).toDestination();

startingNotesButton.addEventListener("mousedown", async (_) => {
    startingNotesIcon.setAttribute("src", "/assets/musical-notes.svg");
    await Tone.start();
    await Tone.loaded();
    sampler.releaseAll(Tone.now());
    let interval = parseFloat(window.localStorage.getItem("playbackInterval") ?? "0.25");
    let duration = parseFloat(window.localStorage.getItem("playbackDuration") ?? "3");
    if (book_song_metadata != null && book_song_metadata[songNum]["notes"] != null) {
        if (
            window.localStorage.getItem("staggered") == "true" ||
            window.localStorage.getItem("staggered") == undefined
        ) {
            for (let i = book_song_metadata[songNum]["notes"].length; i > 0; i--) {
                sampler.triggerAttack(
                    book_song_metadata[songNum]["notes"][i - 1],
                    Tone.now() + interval * (book_song_metadata[songNum]["notes"].length - i)
                );
            }
        } else {
            sampler.triggerAttack(book_song_metadata[songNum]["notes"], Tone.now());
        }
        sampler.triggerRelease(
            book_song_metadata[songNum]["notes"],
            Tone.now() + duration + interval * book_song_metadata[songNum]["notes"].length
        );
    }
    startingNotesIcon.setAttribute("src", "/assets/musical-notes-outline.svg");
});
