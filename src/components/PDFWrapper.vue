<script setup lang="ts">
import { ref, defineProps, onMounted } from "vue";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorkerURL from "pdfjs-dist/legacy/build/pdf.worker.min?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

const props = defineProps<{
    src: URL;
    song: string;
}>();

let song_img_type = ref("");
let song_display_pdf = ref<HTMLDivElement>();
let song_display_img = ref<HTMLImageElement>();
let panzoom_container = ref<HTMLDivElement>();

function getSongSrc(bookShort: string, songNum: string, BOOK_METADATA: { [k: string]: BookSummary }): string {
    const fileName = songNum.padStart(3, "0") + "." + BOOK_METADATA[bookShort].fileExtension;
    if (BOOK_METADATA[bookShort].addOn) {
        return `${BOOK_METADATA[bookShort].srcUrl}/songs/${fileName}`;
    }
    return `/books/${bookShort}/songs/${fileName}`;
}
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
        console.log("yo");
        // displayedImages.push(canvas);

        // Grab current page
        let page = await pdfDoc.getPage(pageNum);
        let viewport = page.getViewport({ scale: 5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let ctx = canvas.getContext("2d"); // 3D faster then 2D?
        if (ctx === null) {
            continue;
        }
        await page.render({
            canvasContext: ctx,
            viewport: viewport,
        }).promise;
    }
}

let song_img_src = ref("");
async function displayWifiFail(e: Event) {
    e.target.src = "assets/wifi_off.svg";
    e.target.style.width = "50%";
    e.target.style.height = "50%";
}

onMounted(async () => {

    song_img_type.value = BOOK_METADATA[props.book].fileExtension;
    if (song_img_type.value === "pdf") {
        displaySongPDF(songSrc);
    } else {
        song_img_src.value = songSrc;
        // displaySongImg(songSrc);
    }
});
</script>

<template>
    <div ref="panzoom_container" class="song_img">
        <div v-if="song_img_type == 'pdf'" ref="song_display_pdf" class="song_img" />
        <div v-else-if="song_img_type !== ''">
            <img @error="displayWifiFail" :src="song_img_src" class="song_img"  />
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
