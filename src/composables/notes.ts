import { useLocalStorage, type MaybeRef } from "@vueuse/core";
import * as Tone from "tone";
import { ref, unref } from "vue";

// const context = new Tone.Context({ latencyHint: "interactive", lookAhead: 0 });
// Tone.setContext(context);

const sampler = new Tone.Sampler({
    urls: Object.fromEntries(["A2", "C3", "A3", "C4", "A4", "C5"].map(note => [note, `assets/notes/${note}.mp3`])),
    baseUrl: import.meta.env.BASE_URL,
}).toDestination();

const interval = useLocalStorage<number>("playbackInterval", 0.25);
const duration = useLocalStorage<number>("playbackDuration", 3);

const isPlaying = ref(false);
let cancel_interval_id: number | undefined = undefined;

const player = {
    async play(notes: MaybeRef<string[]>) {
        // Only play notes if notes are not already playing
        if (isPlaying.value) return;
        isPlaying.value = true;

        console.log("attempting to start notes");
        console.log(...unref(notes));
        await Tone.start();
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

        // I don't like using setInterval, but it seems to be the most reliable way to schedule the end of the notes playing
        // I tried Transport.schedule() and ToneEvent, but both had a delay on android of 1.5s after expected, they also behaved unusually with hot-reload and vite.
        console.log("End:", end_time);
        cancel_interval_id = setInterval(() => {
            const curr_time = Tone.now();
            if (curr_time > end_time) {
                sampler.releaseAll(end_time);
                Tone.Transport.stop(end_time);
                isPlaying.value = false;
                clearInterval(cancel_interval_id);
            }
        }, 10);

        Tone.Transport.start();
    },
    stop() {
        // Release all currently active notes, then cancel any future events from being executed
        clearTimeout(cancel_interval_id);
        sampler.releaseAll();
        Tone.Transport.cancel();
        isPlaying.value = false;
    },
};

export function useNotes() {
    return { player, isPlaying };
}
