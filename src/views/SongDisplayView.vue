<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { onMounted, ref, computed, onUnmounted } from "vue";
import { getAllBookMetaData, getSongMetaData } from "@/scripts/book_import";
import { useRouter } from "vue-router";
import type { BookSummary, SongReference } from "@/scripts/types";
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
const book_summary = ref<BookSummary>();

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
const authorized = useCapacitorPreferences<boolean>("authorized", false);
let broadcasting = ref<boolean>(false);
let verses = ref<number[]>([]);
let verse_input = ref<string>("");

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
    const BOOK_META = await getAllBookMetaData();
    book_summary.value = BOOK_META[props.book];
});

onUnmounted(() => {
    player.stop();
});

let starting_notes_tooltip_status = useLocalStorage<boolean>("starting_notes_tooltip_complete", false);
let tooltip = ref<Element>();

function open_broadcast(e: MouseEvent) {
    broadcasting.value = true;
    let button = (e.target as Element).parentElement?.parentElement;
    button?.style.setProperty("opacity", "0");
}

async function broadcast(e: MouseEvent) {
    let church_id = await Preferences.get({ key: "broadcasting_church"});
    if(church_id.value == null)
        return;
    await set(request_client(), church_id.value, props.number, book_summary.value?.name.medium || props.book, verses.value);

    let button = (e.target as Element).parentElement;
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
            <img @click="(e) => open_broadcast(e)" class="ionicon" src="/assets/radio-outline.svg">
        </div>
    </div>
    <div class="broadcast-container" v-if="authorized" :style="{ opacity: broadcasting ? 1 : 0, visibility: broadcasting ? 'visible' : 'hidden'}" @touchmove="(e) => e.preventDefault()">
        <h1>Broadcast</h1>
        <h3>{{ book_summary?.name.medium || props.book }} - #{{ props.number }}</h3>
        <div class="verse-list">
            <div class="verse" v-for="verse in verses" :key="verse" @click="verses.splice(verses.indexOf(verse), 1)">{{ verse }}</div>
        </div>
        <div>
            <input type="text" v-model="verse_input" class="verse-input" placeholder="Enter verses here..." @keypress="(e) => {
                let char = e.key;
                if(/^[0-9]*$/.test(char)) return true;
                else e.preventDefault();
            }">
            <button class="verse-button" @click="() => {
                if(verses.includes(Number(verse_input)) || isNaN(Number(verse_input)) || verse_input == '') {
                    verse_input = '';
                    return;
                }

                verses.push(Number(verse_input));
                verses.sort((a, b) => a - b);
                verse_input = '';
            }">Add</button>
        </div>
        <button class="send-button" @click="(e) => broadcast(e)">Send</button>
    </div>
    <div class="w-100" style="height: 100vh">
        <SongContainer :book="props.book" :number="props.number"></SongContainer>
    </div>
</template>

<style>
.verse-button {
    background-color: #818181;
    color: white;
    border-radius: 15px;
    padding: 2px 10px;
    height: 30px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    margin: 5px;
}
.send-button {
    background-color: #2196F3;
    color: white;
    border-radius: 15px;
    padding: 6px 20px;
    height: 30px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    margin: 20px;
}
.verse-input::placeholder {
    color: gray;
}
.verse-input {
    margin: 10px 5px;
    width: 50%;
    height: 20px;
    border-radius: 15px;
    background-color: #dfdede;
    color: black;
}
.verse {
    color: var(--color);
    border-radius: 10px;
    background-color: var(--button-color);
    height: 95%;
    line-height: 150%;
    padding: 0 10px;
    max-width: min-content;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
}
.verse-list {
    border-radius: 5px;
    background-color: var(--background);
    width: 75%;
    height: 25px;
    margin: 0 auto;
    display: flex;
    column-gap: 2px;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    padding: 2px 4px;
}
.broadcast-container {
    width: 75%;
    min-height: max-content;
    background-color: var(--div-color);
    border-radius: 15px;
    position: fixed;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    z-index: 1;
    transform: translate(-50%, -50%);
    transition: opacity 0.5s, visibility 0.5s ease;
    opacity: 1;
    text-align: center;
    padding: 15px;
}
.broadcast-button-container {
    position: fixed;
    top: calc(61.16px + env(safe-area-inset-top) + 15px);
    width: 100%;
    display: flex;
    justify-content: right;
    z-index: 1;
    transition: opacity 0.25s;
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
