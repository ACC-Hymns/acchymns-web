<script setup lang="ts">
import { getSongSrc } from "../../js/song-loader";
import { getAllBookMetaData } from "./book_import";
import createPanZoom from "panzoom";
import { Capacitor } from "@capacitor/core";
import { watch, ref, defineProps, onMounted } from "vue";
import { useLocalStorage } from "@vueuse/core";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorkerURL from "pdfjs-dist/legacy/build/pdf.worker.min?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

const props = defineProps<{
    book: string;
    song: string;
}>();

let song_img_type = ref("");
let song_display_pdf = ref<HTMLDivElement>();
let song_display_img = ref<HTMLImageElement>();
let panzoom_container = ref<HTMLDivElement>();

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

async function displaySongPDF(songSrc: string) {
    let pdfDoc = await pdfjsLib.getDocument(songSrc).promise;
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        // Create canvas element to render PDF onto
        let canvas = document.createElement("canvas");
        canvas.classList.add("song_img");
        // invertSongColor(canvas);
        song_display_pdf.value?.appendChild(canvas);
        // displayedImages.push(canvas);

        // Grab current page
        let page = await pdfDoc.getPage(pageNum);
        let viewport = page.getViewport({ scale: 5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let ctx = canvas.getContext("3d"); // 3D faster then 2D?
        if (ctx == null) {
            continue;
        }
        await page.render({
            canvasContext: ctx,
            viewport: viewport,
        }).promise;
    }
}

async function displaySongImg(songSrc: string) {
    // displayedImages = [];
    // invertSongColor(img);
    song_display_img.value?.setAttribute("src", songSrc);
    song_display_img.value?.addEventListener("error", () => {
        song_display_img.value?.src = "assets/wifi_off.svg";
        song_display_img.value?.style.width = "50%";
        song_display_img.value?.style.height = "50%";
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            song_display_img.value?.style.filter = "invert(92%)";
        }
    });
}

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songSrc = getSongSrc(props.book, props.song, BOOK_METADATA);
    createPanZoom(panzoom_container.value, {
        beforeWheel: (e) => {
            return !e.shiftKey;
        },
        maxZoom: 3,
        minZoom: Capacitor.getPlatform() !== "web" ? 1 : 0.25,
        bounds: true,
        boundsPadding: 0.5,
    });

    if (BOOK_METADATA[props.book].fileExtension === "pdf") {
        displaySongPDF(songSrc);
    } else {
        displaySongImg(songSrc);
    }
});
</script>

<template>
    <div ref="panzoom_container">
        <div v-if="song_img_type == 'pdf'" ref="song_display_pdf"></div>
        <div v-else-if="song_img_type !== ''">
            <img ref="song_display_img" class="song_img" />
        </div>
    </div>
</template>

<style>
@import "/css/settings.css";
@import "/css/book.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>

<style scoped>
.song_img {
    display: block;
    width: 100%;
    z-index: -1;
}
</style>
