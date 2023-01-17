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

function finished() {
    startingNotesIcon.setAttribute('src', "/assets/musical-notes.svg");
    const sampler = new Tone.Sampler({
        urls: {
            "A2": blob_A2,
            "C3": blob_C3,
            "A3": blob_A3,
            "C4": blob_C4,
            "A4": blob_A4,
            "C5": blob_C5
        },
        onload: () => {
            var interval = (window.localStorage.getItem("playbackInterval") == undefined) ? 0.25 : parseFloat(window.localStorage.getItem("playbackInterval"));
            var duration = (window.localStorage.getItem("playbackDuration") == undefined) ? 3 : parseFloat(window.localStorage.getItem("playbackDuration"));
            if (book_song_metadata != null && book_song_metadata[songNum]["notes"] != null) {
                if(window.localStorage.getItem("staggered") == "true" || window.localStorage.getItem("staggered") == undefined) {
                    for(var i = (book_song_metadata[songNum]["notes"].length); i > 0; i--) {
                        sampler.triggerAttack(book_song_metadata[songNum]["notes"][i - 1], Tone.now() + (interval * (book_song_metadata[songNum]["notes"].length - i)));
                    }
                } else {
                    sampler.triggerAttack(book_song_metadata[songNum]["notes"], Tone.now());
                }
                sampler.triggerRelease(book_song_metadata[songNum]["notes"], Tone.now() + duration + (interval * book_song_metadata[songNum]["notes"].length));
            }
            startingNotesIcon.setAttribute('src', "/assets/musical-notes-outline.svg");
        }
    }).toDestination();
}

startingNotesButton.addEventListener('mousedown', async (e) => {
    await Tone.start();
    let index = ["A2", "C3", "A3", "C4", "A4", "C5"];
    for (var i = 0; i < index.length; i++) {

        var url = "/assets/notes/" + index[i] + ".mp3";
        let request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = 'blob';
        request.customdata = {note: index[i], index: index, iteration: i};
        request.onload = function(){
            window['blob_' + this.customdata.note] = URL.createObjectURL(this.response);
            if(this.customdata.iteration == (this.customdata.index.length - 1))
                finished();
        };
        request.send();
    }
});
