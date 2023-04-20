<script setup lang="ts">
import { getAllBookMetaData } from "@/scripts/book_import";
import type { BookSummary } from "@/scripts/types";
import createPanZoom from "panzoom";
import { Capacitor } from "@capacitor/core";
import { ref, onMounted } from "vue";
import PDFWrapper from "./PDFWrapper.vue";

const props = defineProps<{
    book: string;
    song: string;
}>();

let song_img_type = ref("");
let panzoom_container = ref<HTMLDivElement>();

function getSongSrc(bookShort: string, songNum: string, BOOK_METADATA: { [k: string]: BookSummary }): string {
    const fileName = songNum.padStart(3, "0") + "." + BOOK_METADATA[bookShort].fileExtension;
    return `${BOOK_METADATA[bookShort].srcUrl}/songs/${fileName}`;
}

let song_img_src = ref("");
let error_is_active = ref(false);

// let displayedImages = [];
// // Change image dynamically if dark/light mode changes
// window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (_) => {
//     for (let element of displayedImages) {
//         invertSongColor(element);
//     }
// });

// function invertSongColor(element) {
//     if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
//         if (window.localStorage.getItem("songInverted") == "true") {
//             element.style.filter = "invert(92%)";
//         } else {
//             element.style.filter = "invert(0%)";
//         }
//     }
// }

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songSrc = getSongSrc(props.book, props.song, BOOK_METADATA);
    song_img_type.value = BOOK_METADATA[props.book].fileExtension;
    song_img_src.value = songSrc;

    createPanZoom(panzoom_container.value as HTMLDivElement, {
        beforeWheel: (e) => {
            return !e.shiftKey;
        },
        maxZoom: 3,
        minZoom: Capacitor.getPlatform() !== "web" ? 1 : 0.25,
        bounds: true,
        boundsPadding: 0.5,
    });
});
</script>

<template>
    <div v-if="error_is_active" class="fallback-container">
        <img src="/assets/wifi_off.svg" class="wifi-fallback" />
    </div>
    <div v-else ref="panzoom_container" class="panzoom-container">
        <PDFWrapper v-if="song_img_type == 'pdf'" @error="error_is_active = true" :src="song_img_src" class="song-img" />
        <img v-else-if="song_img_type !== ''" @error="error_is_active = true" :src="song_img_src" class="song-img" />
    </div>
</template>
<style scoped>
.song-img {
    display: block;
    width: 100%;
    z-index: -1;
}

.wifi-fallback {
    display: block;
    width: 50%;
    z-index: -1;
}

.fallback-container {
    display: flex;
    justify-content: center;
}

.panzoom-container {
    display: block;
    height: max-content;
    width: 100%;
    z-index: -1;
    position: absolute;
    padding-top: calc(env(safe-area-inset-top) + 61.16px);
    top: 0;
    left: 0;
}
</style>
