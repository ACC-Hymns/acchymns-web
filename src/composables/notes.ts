import { useLocalStorage, type MaybeRef } from "@vueuse/core";
import * as Tone from "tone";
import { ref, unref } from "vue";

const notes_to_load = ["A2", "C3", "A3", "C4", "A4", "C5"] as const;

const notes_loaded = Object.fromEntries(notes_to_load.map(note => [note, false]));

const sampler = new Tone.Sampler().toDestination();
Tone.context.lookAhead = 0.05;

for (const note of notes_to_load) {
    fetch(import.meta.env.BASE_URL + `assets/notes/${note}.mp3`).then(async resp => {
        const url = URL.createObjectURL(await resp.blob());
        sampler.add(note, url);
        notes_loaded[note] = true;
    });
}

const interval = useLocalStorage<number>("ACCOptions.playbackInterval", 0.25);
const duration = useLocalStorage<number>("ACCOptions.playbackDuration", 2.5);
const staggered = useLocalStorage<boolean>("ACCOptions.staggered", true);

const isPlaying = ref(false);
let cancel_interval_id: number | undefined = undefined;
const scheduled_notes_interval_id: number[] = [];

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

        let end_time: number;

        if (staggered.value) {
            // Schedule all the notes
            for (const [index, note] of unref(notes).entries()) {
                scheduled_notes_interval_id.push(
                    setTimeout(
                        () => {
                            sampler.triggerAttack(note);
                        },
                        interval.value * index * 1000,
                    ),
                );
            }

            // Notes play for each note * `interval` + additional `duration`;
            end_time = duration.value + interval.value * unref(notes).length;
        } else {
            sampler.triggerAttack(unref(notes));
            end_time = duration.value; // Notes play for `duration` length when playing as a chord
        }

        cancel_interval_id = setTimeout(() => {
            sampler.releaseAll();
            isPlaying.value = false;
        }, end_time * 1000);
    },
    stop() {
        // Release all currently active notes, then cancel any future events from being executed
        for (const id of scheduled_notes_interval_id) {
            clearTimeout(id);
        }
        clearTimeout(cancel_interval_id);
        sampler.releaseAll();
        isPlaying.value = false;
    },
};

export function useNotes() {
    return { player, isPlaying };
}
