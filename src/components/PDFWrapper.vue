<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorkerURL from "pdfjs-dist/legacy/build/pdf.worker.min?url";
import { Capacitor } from "@capacitor/core";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL;

const props = defineProps<{
    src: string;
}>();

const emit = defineEmits<{
    (e: "error"): void;
}>();

let root = ref<HTMLDivElement>();

onMounted(async () => {
    let pdfDoc;
    try {
        pdfDoc = await pdfjsLib.getDocument(props.src).promise;
    } catch {
        emit("error");
        return;
    }
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        // Create canvas element to render PDF onto
        let canvas = document.createElement("canvas");

        // Grab current page
        let page = await pdfDoc.getPage(pageNum);

        // We need a better way of picking the scale...
        const target_scale = Capacitor.getPlatform() == "web" ? 5 : window.devicePixelRatio;
        let viewport = page.getViewport({ scale: target_scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let ctx = canvas.getContext("2d"); // 3D faster then 2D?
        if (ctx === null) {
            emit("error");
            return;
        }
        try {
            await page.render({
                canvasContext: ctx,
                viewport: viewport,
            }).promise;
            canvas.style.width = "100%"; // I don't know why this fixes the PDF being rendered for the full size of the canvas
            const page_url = canvas.toDataURL("image/png");
            const img = document.createElement("img");
            img.classList.add("song-img");
            img.src = page_url;
            root.value?.appendChild(img);
        } catch {
            emit("error");
            return;
        }
    }
});
</script>

<template>
    <div ref="root" class="container" />
</template>

<style>
@import "@/assets/css/settings.css";
@import "@/assets/css/book.css";
</style>

<style>
/* This is to remove the black line between pages */
.song-img {
    width: 100%;
    display: block;
}

.container {
    font-size: 0;
    line-height: 0;
}
</style>
