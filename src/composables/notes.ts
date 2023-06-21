import { useLocalStorage, type MaybeRef } from "@vueuse/core";
import * as Tone from "tone";
import { ref, unref } from "vue";

const notes_to_load = ["A2", "C3", "A3", "C4", "A4", "C5"] as const;

const notes_loaded = Object.fromEntries(notes_to_load.map(note => [note, false]));

// function AJAX(url: string, cb: (request: XMLHttpRequest, event: ProgressEvent<EventTarget>) => void) {
//     const xhr = new XMLHttpRequest();
//     xhr.open("GET", url, true);
//     xhr.responseType = "blob";
//     xhr.onload = event => cb(xhr, event);
//     xhr.send(null);
// }

function FETCH(url: string, cb: (blob: Blob) => void) {
    fetch(url)
        .then(resp => resp.blob())
        .then(blob => cb(blob));
}

const sampler = new Tone.Sampler().toDestination();

for (const note of notes_to_load) {
    // AJAX(import.meta.env.BASE_URL + `assets/notes/${note}.mp3`, (request, _) => {
    //     const url = URL.createObjectURL(request.response);
    //     sampler.add(note, url);
    //     notes_loaded[note] = true;
    // });
    FETCH(import.meta.env.BASE_URL + `assets/notes/${note}.mp3`, blob => {
        const url = URL.createObjectURL(blob);
        sampler.add(note, url);
        notes_loaded[note] = true;
    });
}

const interval = useLocalStorage<number>("playbackInterval", 0.25);
const duration = useLocalStorage<number>("playbackDuration", 3);

const isPlaying = ref(false);
let cancel_interval_id: number | undefined = undefined;

const player = {
    async play(notes: MaybeRef<string[]>) {
        // Only play notes if notes are not already playing
        if (isPlaying.value) return;
        isPlaying.value = true;

        await Tone.start();

        if (!Object.values(notes_loaded).every(v => v)) {
            console.log("Not all notes have been loaded!");
            return;
        }

        if (!sampler.loaded) {
            console.log("Sampler hasn't loaded!");
            return;
        }

        console.log("attempting to start notes");
        console.log(...unref(notes));
        await Tone.loaded();

        const start = Tone.now();
        let end_time: number;

        if ((localStorage.getItem("staggered") ?? "true") === "true") {
            // Schedule all the notes
            for (const [index, note] of unref(notes).entries()) {
                sampler.triggerAttack(note, start + interval.value * index);
            }

            // Notes play for each note * `interval` + additional `duration`;
            end_time = start + duration.value + interval.value * unref(notes).length;
        } else {
            sampler.triggerAttack(unref(notes), Tone.now());
            end_time = start + duration.value; // Notes play for `duration` length when playing as a chord
        }

        sampler.triggerRelease(unref(notes), end_time);

        // I don't like using setInterval, but it seems to be the most reliable way to schedule the end of the notes playing
        // I tried Transport.schedule() and ToneEvent, but both had a delay on android of 1.5s after expected, they also behaved unusually with hot-reload and vite.
        console.log("End:", end_time);
        cancel_interval_id = setInterval(() => {
            const curr_time = Tone.now();
            if (curr_time > end_time) {
                isPlaying.value = false;
                clearInterval(cancel_interval_id);
            }
        }, 50);
    },
    stop() {
        // Release all currently active notes, then cancel any future events from being executed
        clearTimeout(cancel_interval_id);
        sampler.releaseAll();
        isPlaying.value = false;
    },
};

export function useNotes() {
    return { player, isPlaying };
}
