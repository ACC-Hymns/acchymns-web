<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorkerURL from "pdfjs-dist/legacy/build/pdf.worker.min?url";
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
        let viewport = page.getViewport({ scale: 5 });
        canvas.height = viewport.height * window.devicePixelRatio;
        canvas.width = viewport.width * window.devicePixelRatio;
        canvas.classList.add("song-img");

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
            root.value?.appendChild(canvas);
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
@import "/css/settings.css";
@import "/css/book.css";
</style>

<style scoped>
.song-img {
    display: block;
    width: 100%;
    z-index: -1;
}

/* This is to remove the black line between pages */
.container {
    font-size: 0;
    line-height: 0;
}
</style>
