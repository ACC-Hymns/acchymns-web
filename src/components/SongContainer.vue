<script setup lang="ts">
import { fetchBookSummary } from "../../js/book_import.js";
import type { BookSummary } from "../../js/types";
import { getSongSrc } from "../../js/song-loader.js";
import { getAllBookMetaData } from "./book_import";
import panzoom from "panzoom";
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

let song_img_type = ref<string>("");
let pdf_canvases = ref(null);

const panzoomContainer = document.getElementById("panzoomContainer");
panzoom(panzoomContainer, {
    beforeWheel: (e) => {
        return !e.shiftKey;
    },
    maxZoom: 3,
    minZoom: Capacitor.getPlatform() !== "web" ? 1 : 0.25,
    bounds: true,
    boundsPadding: 0.5,
});

let displayedImages = [];
// Change image dynamically if dark/light mode changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (_) => {
    for (let element of displayedImages) {
        invertSongColor(element);
    }
});

function invertSongColor(element) {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        if (window.localStorage.getItem("songInverted") == "true") {
            element.style.filter = "invert(92%)";
        } else {
            element.style.filter = "invert(0%)";
        }
    }
}

async function displaySongPDF(songSrc) {
    let pdfDoc = await pdfjsLib.getDocument(songSrc).promise;
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        // Create canvas element to render PDF onto
        invertSongColor(canvas);
        panzoomContainer.appendChild(canvas);
        displayedImages.push(canvas);

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

async function displaySongImg(songSrc) {
    displayedImages = [];
    invertSongColor(img);
    displayedImages.push(img);
    img.setAttribute("src", songSrc);
    img.onerror = () => {
        img.src = "assets/wifi_off.svg";
        img.style.width = "50%";
        img.style.height = "50%";
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            img.style.filter = "invert(92%)";
        }
    };
}


onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songSrc = getSongSrc(props.book, props.song, BOOK_METADATA);
    if (BOOK_METADATA[props.book].fileExtension === "pdf") {
        displaySongPDF(songSrc);
    } else {
        displaySongImg(songSrc);
    }
});
</script>

<template>
    <!-- Publicly available, but not imported books -->
    <div v-if="song_img_type == 'pdf'">
        <canvas v-for="" ref="pdf_canvases" class="song_img"/>
    </div>
    <div v-else-if="song_img_type !== ''">
        <img class="song_img" />
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
