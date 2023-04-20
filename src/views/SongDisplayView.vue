<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { onMounted, ref, computed, onUnmounted } from "vue";
import * as Tone from "tone";
import { getSongMetaData } from "@/scripts/book_import";
import { useRouter } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import type { BookmarkedSong } from "@/scripts/types";

const props = defineProps<{
    book: string;
    song: string;
}>();
const router = useRouter();
let notes_playing = ref(false);
let notes = ref<string[]>([]);
let bookmarks = useLocalStorage<BookmarkedSong[]>("bookmarks", []);
let bookmarked = computed(() => {
    return -1 != bookmarks.value.findIndex((bookmark) => bookmark.book == props.book && bookmark.song == props.song);
});

function toggleBookmark() {
    if (!bookmarked.value) {
        bookmarks.value.push(props as BookmarkedSong);
    } else {
        let index = bookmarks.value.findIndex((bookmark) => bookmark.book == props.book && bookmark.song == props.song);
        bookmarks.value.splice(index, 1);
    }
}

let sampler: Tone.Sampler;

async function playNotes() {
    // Only play notes if notes are not already playing
    if (notes_playing.value) return;
    notes_playing.value = true;

    console.log("attempting to start notes");
    const start = performance.now();

    await Tone.start();
    await Tone.loaded();

    let interval = parseFloat(window.localStorage.getItem("playbackInterval") ?? "0.25");
    let duration = parseFloat(window.localStorage.getItem("playbackDuration") ?? "3");
    if ((window.localStorage.getItem("staggered") ?? "true") === "true") {
        // Schedule all the notes
        const seq = new Tone.Sequence((time, note) => sampler.triggerAttack(note, time), notes.value, interval);
        seq.humanize = true; // Add some variance to the schedule of the notes
        seq.loop = false;
        seq.start(Tone.now());

        // Stop all notes when end_time is reached
        const end_time = Tone.now() + duration + interval * notes.value.length;
        new Tone.ToneEvent(() => {
            sampler.releaseAll();
            notes_playing.value = false;
        }).start(end_time);

        Tone.Transport.start();
    } else {
        sampler.triggerAttackRelease(notes.value, duration);
    }
    console.log(`notes started (${performance.now() - start} ms)`);
}

onMounted(async () => {
    const audio_context = new AudioContext();
    async function fetchNote(note: string) {
        const mp3 = await fetch(import.meta.env.BASE_URL + `assets/notes/${note}.mp3`);
        const blob = await mp3.blob();
        const array_buffer = await blob.arrayBuffer();
        const audio_buffer = await audio_context.decodeAudioData(array_buffer);
        return audio_buffer;
    }
    async function constructUrls(notes: string[]) {
        const audio_buffers = await Promise.all(notes.map((note) => fetchNote(note)));
        return Object.fromEntries(audio_buffers.map((buffer, index) => [notes[index], buffer]));
    }
    sampler = new Tone.Sampler({
        urls: await constructUrls(["A2", "C3", "A3", "C4", "A4", "C5"]),
    }).toDestination();
    const SONG_METADATA = await getSongMetaData(props.book);
    notes.value = (SONG_METADATA[props.song]?.notes ?? []).reverse(); // Reverse as we want bass -> soprano
});

onUnmounted(() => {
    // Release all currently active notes, then cancel any future events from being executed
    sampler.releaseAll();
    Tone.Transport.cancel();
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="buttonGroupLeft">
                <img @click="router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />

                <!-- Empty element cause CSS too hard -->
                <a></a>
            </div>
            <h1>#{{ props.song }}</h1>
            <div class="buttonGroupRight">
                <span v-if="notes.length != 0">
                    <img v-if="!notes_playing" @click="playNotes()" class="ionicon" src="/assets/musical-notes-outline.svg" />
                    <img v-else class="ionicon" src="/assets/musical-notes.svg" />
                </span>

                <img v-if="bookmarked" @click="toggleBookmark()" class="ionicon" src="/assets/bookmark.svg" />
                <img v-else @click="toggleBookmark()" class="ionicon" src="/assets/bookmark-outline.svg" />
            </div>
        </div>
    </div>
    <div class="w-100" style="height: 100vh">
        <SongContainer :book="props.book" :song="props.song"></SongContainer>
    </div>
</template>

<style>
@import "/css/selection.css";
</style>
