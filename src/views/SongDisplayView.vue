<script setup lang="ts">
import SongContainer from '@/components/SongContainer.vue';
import { onMounted, ref } from 'vue';
import * as Tone from "tone";
import { getSongMetaData } from "@/scripts/book_import";

const props = defineProps<{
    book: string;
    song: string;
}>();
let notes_playing = ref(false);
let notes = ref<string[]>([]);

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

async function playNotes() {
    notes_playing.value = true;
    await Tone.start();
    await Tone.loaded();

    let interval = parseFloat(window.localStorage.getItem("playbackInterval") ?? "0.25");
    let duration = parseFloat(window.localStorage.getItem("playbackDuration") ?? "3");
    if ((window.localStorage.getItem("staggered") ?? "true") === "true") {
        const end_time = Tone.now() + duration + interval * notes.value.length;
        const seq = new Tone.Sequence(
            (time, note) => {
                sampler.triggerAttack(note, time);
                sampler.triggerRelease(note, end_time);
            },
            notes.value,
            interval
        );
        seq.loop = false;
        seq.start(Tone.now());
        new Tone.ToneEvent(() => {
            notes_playing.value = false;
        }).start(end_time);
        Tone.Transport.start();
    } else {
        sampler.triggerAttackRelease(notes.value, duration);
    }
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
                <img @click="$router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg"/>
                <a><img class="ionicon" /></a>
            </div>
            <h1>#{{ props.song }}</h1>
            <div class="buttonGroupRight">
                <span v-if="notes.length != 0">
                    <img
                        v-if="!notes_playing"
                        @click="playNotes()"
                        class="ionicon"
                        src="/assets/musical-notes-outline.svg"
                    />
                    <img v-else class="ionicon" src="/assets/musical-notes.svg" />
                </span>

                <img class="ionicon" src="/assets/bookmark-outline.svg" />
            </div>
        </div>
    </div>
    <div class="w-100" style="height: 100vh">
        <SongContainer class="panzoom_container" :book="props.book" :song="props.song"></SongContainer>
    </div>
</template>

<style>
@import "/css/selection.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
