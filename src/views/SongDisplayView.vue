<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { onMounted, ref, computed } from "vue";
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

const sampler = new Tone.Sampler({
    urls: {
        A2: "assets/notes/A2.mp3",
        C3: "assets/notes/C3.mp3",
        A3: "assets/notes/A3.mp3",
        C4: "assets/notes/C4.mp3",
        A4: "assets/notes/A4.mp3",
        C5: "assets/notes/C5.mp3",
    },
    baseUrl: import.meta.env.BASE_URL,
}).toDestination();

async function playNotes() {
    // Only play notes if notes are not already playing
    if (notes_playing.value) return;
    notes_playing.value = true;

    console.log("attempting to start notes")
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
        seq.start(Tone.now() - interval);

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
    console.log(`notes started (${performance.now() - start} ms)`)
}

onMounted(async () => {
    const SONG_METADATA = await getSongMetaData(props.book);
    notes.value = (SONG_METADATA[props.song]?.notes ?? []).reverse(); // Reverse as we want bass -> soprano
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
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
