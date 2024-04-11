<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { onMounted, ref, computed, onUnmounted } from "vue";
import { getSongMetaData } from "@/scripts/book_import";
import { useRouter } from "vue-router";
import type { SongReference } from "@/scripts/types";
import { useNotes } from "@/composables/notes";
import { Toast } from "@capacitor/toast";
import { useCapacitorPreferences } from "@/composables/preferences";
import { useLocalStorage } from "@vueuse/core";

const props = defineProps<SongReference>();

const router = useRouter();

const { player, isPlaying } = useNotes();
const notes = ref<string[]>([]);

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
const is_bookmarked = computed(() => {
    return -1 != bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
});

async function toggleBookmark() {
    if (!is_bookmarked.value) {
        bookmarks.value.push(props as SongReference);
        await Toast.show({
            text: `#${props.number} added to Bookmarks`,
        });
    } else {
        const index = bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
        bookmarks.value.splice(index, 1); // Remove the bookmarked song
        await Toast.show({
            text: `#${props.number} removed from Bookmarks`,
        });
    }
}

onMounted(async () => {
    const SONG_METADATA = await getSongMetaData(props.book);
    if (SONG_METADATA != null) {
        notes.value = (SONG_METADATA[props.number]?.notes ?? []).reverse(); // Reverse as we want bass -> soprano
    }
});

onUnmounted(() => {
    player.stop();
});

let starting_notes_tooltip_status = useLocalStorage<boolean>("starting_notes_tooltip_complete", false);
let tooltip = ref<Element>();
let media_panel_visible = ref<boolean>(false);
let media_panel_height = ref<number>(0.3);

function play() {
    //player.play(notes);
    //hideTooltip();
    media_panel_visible.value = !media_panel_visible.value;
}

function hideTooltip() {
    tooltip.value?.classList.add("tooltiphidden");
    tooltip.value?.classList.add("tooltip");
    setTimeout(() => {
        starting_notes_tooltip_status.value = true;
    }, 1000);
}

function setMediaPanel(event: any, value: boolean) {
    event.preventDefault();
    media_starting_notes.value = value;
}

function drag(e: TouchEvent) {
    e.preventDefault();
    media_panel_height.value = 1 - (e.touches[0].pageY)/window.innerHeight;
}
function dragEnd(e: TouchEvent) {
    e.preventDefault();
    let distance_a = Math.abs(0.3 - media_panel_height.value);
    let distance_b = Math.abs(0.1 - media_panel_height.value);
    
    if(distance_a <= distance_b)
        media_panel_height.value = 0.3;
    else
        media_panel_height.value = 0.1;
}

</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>#{{ props.number }}</h1>
            </div>
            <div class="title--right">
                <template v-if="notes.length != 0">
                    <img v-if="!isPlaying" @click="play" class="ionicon" src="/assets/musical-notes-outline.svg" />
                    <img v-else class="ionicon" src="/assets/musical-notes.svg" />
                    <div v-if:="!starting_notes_tooltip_status" class="tooltip" ref="tooltip" @click="hideTooltip()">
                        <p class="tooltiptext">New! Starting Notes</p>
                    </div>
                </template>

                <img v-if="is_bookmarked" @click="toggleBookmark()" class="ionicon" src="/assets/bookmark.svg" />
                <img v-else @click="toggleBookmark()" class="ionicon" src="/assets/bookmark-outline.svg" />
            </div>
        </div>
    </div>
    <div class="media-panel" :class="{ hidden: !media_panel_visible}" :style="'height:' + (media_panel_height * 100) + '%'">   
            <div class="handle-bar-container" @touchstart="(e) => drag(e)" @touchmove="(e) => drag(e)" @touchend="(e) => dragEnd(e)">
                <div class="handle-bar"></div>
            </div>
            <div class="media-type">
                <div :class="!media_starting_notes ? 'media-type-indicator-active' : 'media-type-indicator'" @click="(e) => setMediaPanel(e, false)" @touchstart="(e) => setMediaPanel(e, false)">
                    <p class="media-type-title">Piano</p>           
                </div>
                <div :class="media_starting_notes ? 'media-type-indicator-active' : 'media-type-indicator'" @click="(e) => setMediaPanel(e, true)" @touchstart="(e) => setMediaPanel(e, true)">
                    <p class="media-type-title">Starting Notes</p>           
                </div>
            </div>
        </div>
    <div class="w-100" style="height: 100vh">
        <SongContainer :book="props.book" :number="props.number"></SongContainer>
    </div>
    
</template>

<style>

.media-type-title  {
    margin: 0px  0px;
    color: black;
    font-weight: bold;
    font-size: small;
    line-height: 35px;
}
.media-type-indicator {
    height: 33px;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 15px;
}
.media-type-indicator-active {
    background-color: white;
    height: 33px;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 25px;
}
.media-type {
    background-color: #EBEBEB;
    width: 200px;
    height: 35px;
    border-radius: 15px;
    margin: 15px auto;
    display: flex;
    justify-content:space-between;
    align-items: center;
    padding: 0px 1px;
}
.handle-bar-container {
    width: 100%;
    height: 20px;
}
.handle-bar {
    background-color: #818181;
    width: 50px;
    height: 2px;
    border-radius: 15px;
    margin: 10px auto;
}
.media-panel {
    width: 100%;
    background-color: white;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.25);
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 1;
    border-radius: 15px 15px 0px 0px;
}

.tooltip {
    min-width: 155px;
    height: 25px;
    background-color: #2196f3;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.25);
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    translate: -70px 10px;
    opacity: 1;
}

.tooltiphidden {
    height: 25px;
    background-color: #2196f3;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.25);
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    opacity: 0;
    transition: opacity 500ms ease;
}

.tooltip::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent #2196f3 transparent;
}

.tooltiptext {
    margin: 0px 10px;
    line-height: 25px;
    font-size: 15px;
    color: white;
}
</style>
