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
import { Preferences } from "@capacitor/preferences";
import { request_client, set } from "@/scripts/broadcast";

const props = defineProps<SongReference>();

const router = useRouter();

const { player, isPlaying } = useNotes();
const notes = ref<string[]>([]);

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
const authorized = useCapacitorPreferences<boolean>("authorized", false);
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

async function broadcast(e: MouseEvent) {
    let church_id = await Preferences.get({ key: "broadcasting_church"});
    if(church_id.value == null)
        return;
    set(request_client(), church_id.value, props.number, props.book);
    let button = (e.target as Element).parentElement?.parentElement;
    button?.style.setProperty("opacity", "0");
}

function play() {
    player.play(notes);
    hideTooltip();
}

function hideTooltip() {
    tooltip.value?.classList.add("tooltiphidden");
    tooltip.value?.classList.add("tooltip");
    setTimeout(() => {
        starting_notes_tooltip_status.value = true;
    }, 1000);
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
    <div class="broadcast-button-container" v-if="authorized">
        <div class="broadcast-button">
            <img @click="(e) => broadcast(e)" class="ionicon" src="/assets/radio-outline.svg">
        </div>
    </div>
    <div class="w-100" style="height: 100vh">
        <SongContainer :book="props.book" :number="props.number"></SongContainer>
    </div>
</template>

<style>
.broadcast-button-container {
    position: fixed;
    top: calc(61.16px + env(safe-area-inset-top) + 15px);
    width: 100%;
    display: flex;
    justify-content: right;
    z-index: 1;
    transition: opacity 1s;
    opacity: 1;
}

.broadcast-button {
    height: 10vw;
    width: 10vw;
    max-height: 50px;
    max-width: 50px;
    background-color: var(--button-color);
    border-radius: 50px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    margin: 0 5vw;
    transition: transform 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
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
