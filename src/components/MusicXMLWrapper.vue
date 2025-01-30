<script setup lang="ts">
import { ref, onMounted } from "vue";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

const props = defineProps<{
    src: string;
}>();

const emit = defineEmits<{
    (e: "error"): void;
}>();

let root = ref<HTMLDivElement>();

onMounted(async () => {
    console.log("Loading MusicXML");
    console.log(root.value)
    try {
        const osmd = new OpenSheetMusicDisplay(root.value as HTMLDivElement, {
            autoResize: false,
            backend: "canvas",
            disableCursor: false,
            pageBackgroundColor: "white",
            stretchLastSystemLine: true,
            autoGenerateMultipleRestMeasuresFromRestMeasures: false,
            drawMeasureNumbers: false,
            drawCredits: true,
            newSystemFromXML: true,
            newSystemFromNewPageInXML: true,
            onXMLRead: fixXML,
        });
        osmd.setLogLevel("debug");
        await osmd.load(props.src);
        await osmd.render();
    } catch (e) {
        console.log(e);
        emit("error");
        return;
    }
});

// This function is to fix minimal errors/discrepancies in the xml files.
function fixXML(xml: string): string {
    // The Hangoljatok Szenteket songbook has a different format for the title of the song
    if (props.src.includes("/HS")) {
        // Move the title from the credit-words element to the movement-title element
        const title = xml.match(/<credit-words.*?>(\d+.*?)<\/credit-words>/)?.[1];
        if (title) {
            xml = xml.replace(/<score-partwise(.*?)>/, `<score-partwise$1><movement-title>${title}</movement-title>`);
        }
        console.log(xml);
    }
    return xml;
}

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
