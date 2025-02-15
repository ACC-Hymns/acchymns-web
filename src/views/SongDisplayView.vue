<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import DropdownMenu from "@/components/DropdownMenu.vue";
import { bass_note_icons, treble_note_icons } from "@/composables/notes";
import { ref, computed, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { animate, pause_path, play_path } from "@/scripts/morph";
import { type BookSummary, type SongReference } from "@/scripts/types";
import { useNotes } from "@/composables/notes";
import { Toast } from "@capacitor/toast";
import { useCapacitorPreferences } from "@/composables/preferences";
import { interpolate } from "polymorph-js";
import { request_client, set } from "@/scripts/broadcast";
import { useBroadcastAPI } from "@/composables/broadcast";
import { vOnClickOutside } from "@vueuse/components";
import { useEventListener, useMediaControls, type OnClickOutsideOptions } from "@vueuse/core";

const props = defineProps<SongReference>();

// Bookmarks
const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);

const is_bookmarked = computed(() => {
    return -1 != bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
});

async function toggleBookmark() {
    if (!is_bookmarked.value) {
        bookmarks.value.push({ ...props } as SongReference);
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

const media_starting_notes = ref<boolean>(true);

type Coordinate = {
    x: number;
    y: number;
};

const panel = ref<{ visible: boolean }>({ visible: false });

import { useAllBookSummaries, useBookSongMetaData } from "@/composables/book_metadata";

const BOOK_METADATA = useAllBookSummaries();
const book_summary = computed<BookSummary | undefined>(() => BOOK_METADATA.result.value[props.book]);

const SONG_METADATA = useBookSongMetaData(props.book);
const title = computed(() => SONG_METADATA.result.value[props.number]?.title ?? "Unknown");
const song_notes = computed(() => [...(SONG_METADATA.result.value[props.number]?.notes ?? [])].reverse()); // Reverse as we want bass -> soprano
const song_count = computed(() => Object.keys(SONG_METADATA.result.value).length);

const menu_bar_visible = ref<boolean>(true);
const hide_touch_pos = ref<Coordinate>({ x: 0, y: 0 });

const dropdown_open = ref<boolean>(false);
const dropdown_button = ref<HTMLElement | null>(null);
const closeDropdown: [(_: any) => void, OnClickOutsideOptions] = [_ => (dropdown_open.value = false), { ignore: [dropdown_button] }];

// Notes
const { player } = useNotes();
onUnmounted(() => {
    player.stop();
    audio.playing.value = false;
});

async function play_all_notes() {
    audio.playing.value = false;
    player.stop();
    player.play(song_notes.value);
}
async function play_note(note: string) {
    audio.playing.value = false;
    player.stop();
    player.play([note]);
}

function get_note_icon(note: string) {
    const modified_note = note.replace("#", "").replace("b", "");
    if (song_notes.value.indexOf(note) > 1 || !Object.keys(bass_note_icons).includes(modified_note)) return treble_note_icons[modified_note];
    return bass_note_icons[modified_note];
}

// Media Panel
import { useScreenOrientation } from "@/composables/screen_orientation";
const { isLandscape } = useScreenOrientation();
async function toggleMediaPanel() {
    panel.value.visible = !panel.value.visible;
    if (!panel.value.visible) audio.playing.value = false;
}

// Media Playing
const audio_source = ref<HTMLAudioElement>();
const audio = useMediaControls(audio_source);
const audio_source_exists = ref<boolean>(true);
useEventListener(audio_source, "error", () => {
    console.error("Error loading audio");
    audio_source_exists.value = false;
});
const audio_percentage = computed(() => {
    return `${(audio.currentTime.value / audio.duration.value) * 100}%`;
});

watch([song_notes, audio_source_exists], () => {
    if (song_notes.value.length == 0 && audio_source_exists.value) media_starting_notes.value = false;
});

const morphed_path = ref<string>(play_path);

watch(audio.playing, () => {
    const path_order = audio.playing.value ? [play_path, pause_path] : [pause_path, play_path];
    const interpolator = interpolate(path_order, {
        addPoints: 0,
        origin: { x: 0, y: 0 },
        optimize: "fill",
        precision: 0,
    });
    animate(path => (morphed_path.value = path), interpolator);
});

function secondsToTimestamp(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    let remaining_seconds = Math.floor(seconds % 60);
    return `${minutes}:${remaining_seconds < 10 ? "0" : ""}${remaining_seconds}`;
}

function toggleMenu() {
    menu_bar_visible.value = !menu_bar_visible.value;
}

// Song Traversal
const router = useRouter();

async function traverseToAdjacentSong(dir: number) {
    const song_numbers = Object.keys(SONG_METADATA.result.value).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    const index = song_numbers.findIndex(song => song == props.number);
    if (index == -1) {
        console.error("Error finding song in metadata. Cannot traverse song.");
        return;
    }
    if (index + dir < 0 || index + dir >= song_numbers.length) {
        console.error("Cannot traverse song. Out of bounds.");
        return;
    }
    await router.replace(`/display/${props.book}/${song_numbers[index + dir]}`);
}

// Sharing
import { Share } from "@capacitor/share";

async function shareSong() {
    await Share.share({
        title: `${title.value}`,
        text: `#${props.number} from ${book_summary.value?.name.medium} available online now!`,
        url: `https://acchymns.app/display/${props.book}/${props.number}`,
    });
}

const can_share = ref<boolean>(false);
Share.canShare().then(res => (can_share.value = res.value));

// Broadcast
const is_broadcast_menu_open = ref<boolean>(false);
const verses = ref<number[]>([]);
const broadcast_api = useBroadcastAPI();

function toggleVerse(verse: number) {
    if (verses.value[0] == -2) verses.value = [];

    if (verses.value.includes(verse)) verses.value.splice(verses.value.indexOf(verse), 1);
    else verses.value.push(verse);
}

function toggleAllVerses() {
    if (verses.value[0] == -2) verses.value = [];
    else verses.value = [-2];
}

function closeBroadcastMenu() {
    is_broadcast_menu_open.value = false;
}

async function broadcast() {
    if (broadcast_api.church_id.value == null) return;

    await set(
        request_client(),
        broadcast_api.church_id.value,
        props.number,
        book_summary.value?.name.medium || props.book,
        verses.value,
        book_summary.value?.primaryColor || "#000000",
    );

    closeBroadcastMenu();
}
</script>

<template>
    <audio ref="audio_source" :src="`https://acchymnsmedia.s3.us-east-2.amazonaws.com/${props.book}/${props.number}.mp3`"></audio>
    <div class="full" :class="{ dark: dropdown_open }"></div>
    <div class="menu" :class="{ 'menu-hidden': !menu_bar_visible }">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>#{{ props.number }}</h1>
            </div>
            <div class="title--right">
                <template v-if="song_notes.length != 0 || audio_source_exists">
                    <img v-if="!panel.visible" @click="toggleMediaPanel()" class="ionicon" src="/assets/musical-notes-outline.svg" />
                    <img v-else class="ionicon" @click="toggleMediaPanel()" src="/assets/musical-notes.svg" />
                </template>

                <img
                    class="ionicon"
                    ref="dropdown_button"
                    @click="dropdown_open = !dropdown_open"
                    src="/assets/ellipsis-horizontal-circle-outline.svg"
                />
                <DropdownMenu class="dropdown-menu" :dropdown_open="dropdown_open" v-on-click-outside="closeDropdown">
                    <div
                        @click="
                            toggleBookmark();
                            dropdown_open = false;
                        "
                    >
                        <div>Bookmark</div>
                        <img class="ionicon" :src="is_bookmarked ? '/assets/bookmark.svg' : '/assets/bookmark-outline.svg'" />
                    </div>
                    <div
                        v-if="can_share"
                        @click="
                            shareSong();
                            dropdown_open = false;
                        "
                    >
                        <div>Share</div>
                        <img class="ionicon" src="/assets/share-outline.svg" />
                    </div>
                    <div
                        v-if="broadcast_api.is_authorized.value && !is_broadcast_menu_open"
                        @click="
                            is_broadcast_menu_open = true;
                            dropdown_open = false;
                        "
                    >
                        <div>Broadcast</div>
                        <img class="ionicon" src="/assets/radio-outline.svg" />
                    </div>
                </DropdownMenu>
            </div>
        </div>
    </div>

    <!-- Buttons -->
    <div class="page-button-container left">
        <div
            class="page-button"
            :class="{ 'arrow-hidden-left': panel.visible || !menu_bar_visible || Number(props.number) == 1 }"
            @click="traverseToAdjacentSong(-1)"
        >
            <img class="ionicon" src="/assets/chevron-back-outline.svg" />
        </div>
    </div>
    <div class="page-button-container right">
        <div
            class="page-button"
            :class="{ 'arrow-hidden-right': panel.visible || !menu_bar_visible || Number(props.number) == song_count }"
            @click="traverseToAdjacentSong(1)"
        >
            <img class="ionicon" src="/assets/chevron-forward-outline.svg" />
        </div>
    </div>

    <!-- Broadcast Popup -->
    <div
        class="broadcast-container"
        v-if="broadcast_api.is_authorized && is_broadcast_menu_open"
        @touchmove="e => e.preventDefault()"
        v-on-click-outside="closeBroadcastMenu"
    >
        <h1>Broadcast</h1>
        <div class="broadcast-close-button">
            <img @click="closeBroadcastMenu" class="ionicon" src="/assets/close.svg" />
        </div>
        <h3>{{ book_summary?.name.medium || props.book }} - #{{ props.number }}</h3>
        <h3>Verses</h3>
        <a class="verse" :class="{ 'verse-selected': verses[0] == -2 }" @click="toggleAllVerses()"> All </a>
        <br />
        <div class="verse-list">
            <a v-for="verse in 12" :key="verse" class="verse" :class="{ 'verse-selected': verses.includes(verse) }" @click="toggleVerse(verse)">
                {{ verse }}
            </a>
        </div>
        <button class="send-button" @click="broadcast()">Send</button>
    </div>

    <div class="media-panel-content" :class="{ 'hidden-panel': !panel.visible || !menu_bar_visible }">
        <div class="media-panel-blur"></div>
        <div class="media-panel-top-row">
            <div></div>
            <div class="media-type">
                <!-- Piano shows if it is available & media_starting_notes = false -->
                <div
                    v-if="audio_source_exists"
                    class="media-type-indicator"
                    :class="{ active: !media_starting_notes }"
                    @click="media_starting_notes = false"
                >
                    <p class="media-type-title">Piano</p>
                </div>
                <!-- Piano shows if it is available & media_starting_notes = true -->
                <div
                    v-if="song_notes.length != 0"
                    class="media-type-indicator"
                    :class="{ active: media_starting_notes }"
                    @click="media_starting_notes = true"
                >
                    <p class="media-type-title">Starting Notes</p>
                </div>
            </div>
            <div>
                <img @click="toggleMediaPanel()" class="ionicon" src="/assets/close.svg" />
            </div>
        </div>

        <!-- Landscape mode gets a mini-player and mini notes -->
        <template v-if="isLandscape">
            <!-- Mini Piano Player -->
            <div v-if="!media_starting_notes && audio_source_exists" class="timeline">
                <p class="timestamp">{{ secondsToTimestamp(audio.currentTime.value) }}</p>
                <div class="progress-bar">
                    <input type="range" class="media-timeline" :min="0" :max="audio.duration.value" step="0.1" v-model="audio.currentTime.value" />
                </div>
                <p class="timestamp">{{ secondsToTimestamp(audio.duration.value) }}</p>
                <svg @click="audio.playing.value = !audio.playing.value" class="play-button small" viewBox="0 0 512 512">
                    <path id="svg_content" class="play-button-path" :d="morphed_path"></path>
                </svg>
            </div>
            <!-- Starting Notes -->
            <div v-if="media_starting_notes && song_notes.length != 0" class="starting-notes-container">
                <div class="note-button small" @click="play_all_notes()">
                    <p>All</p>
                </div>
                <template v-for="note in song_notes" :key="note">
                    <div class="note-button small" @click="play_note(note)">
                        <p>{{ note }}</p>
                    </div>
                </template>
            </div>
        </template>
        <!-- Portrait mode has the full player -->
        <template v-else>
            <!-- Piano Player -->
            <div v-if="!media_starting_notes && audio_source_exists">
                <div class="playback-container">
                    <svg @click="audio.playing.value = !audio.playing.value" class="play-button" viewBox="0 0 512 512">
                        <path id="svg_content" class="play-button-path" :d="morphed_path"></path>
                    </svg>
                </div>
                <div class="timeline">
                    <p class="timestamp">{{ secondsToTimestamp(audio.currentTime.value) }}</p>
                    <div class="progress-bar">
                        <input
                            type="range"
                            class="media-timeline"
                            :min="0"
                            :max="audio.duration.value"
                            step="0.1"
                            v-model="audio.currentTime.value"
                        />
                    </div>
                    <p class="timestamp">{{ secondsToTimestamp(audio.duration.value) }}</p>
                </div>
            </div>
            <!-- Starting Notes Player -->
            <div v-if="media_starting_notes && song_notes.length != 0" class="starting-notes-container">
                <div class="note-container">
                    <div class="note-button" @click="play_all_notes()">
                        <img class="ionicon starting-note-icon-all" src="/assets/musical-notes.svg" />
                    </div>
                    <p>All</p>
                </div>
                <div v-for="note in song_notes" :key="note" class="note-container" @click="play_note(note)">
                    <div class="note-button">
                        <img class="ionicon starting-note-icon" :src="get_note_icon(note)" />
                    </div>
                    <p>{{ note }}</p>
                </div>
            </div>
        </template>
    </div>
    <div
        class="w-100"
        style="height: 100vh"
        @mousedown="e => (hide_touch_pos = { x: e.screenX, y: e.screenY })"
        @mouseup="
            e => {
                if (Math.abs(hide_touch_pos.x - e.screenX) < 5 && Math.abs(hide_touch_pos.y - e.screenY) < 5) toggleMenu();
            }
        "
        @touchstart="e => (hide_touch_pos = { x: e.touches[0].screenX, y: e.touches[0].screenY })"
        @touchend="
            e => {
                if (Math.abs(hide_touch_pos.x - e.changedTouches[0].screenX) < 5 && Math.abs(hide_touch_pos.y - e.changedTouches[0].screenY) < 5)
                    toggleMenu();
            }
        "
    >
        <SongContainer :book="props.book" :number="props.number"></SongContainer>
    </div>
</template>

<style>
.full {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition:
        opacity 0.2s ease,
        visibility 0.2s ease;
    background-color: rgba(0, 0, 0, 0.125);
    opacity: 0;
    visibility: hidden;
}
.dark {
    opacity: 1;
    visibility: visible;
}

.dropdown-menu {
    top: calc(40px + env(safe-area-inset-top));
    right: 15px;
}

.send-button {
    background-color: var(--blue);
    color: white;
    border-radius: 15px;
    padding: 6px 20px;
    height: 30px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    margin: 20px;
}
.verse {
    color: var(--color);
    border-radius: 50px;
    background-color: var(--button-color);
    margin: 5px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    padding: 15px 15px;
}

.verse-selected {
    box-shadow: inset 0 0 0 4px var(--blue);
}
.verse-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 15px 0;
}
.broadcast-container {
    width: 75%;
    min-height: max-content;
    background-color: var(--toolbar);
    border-radius: 15px;
    position: fixed;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    z-index: 2;
    transform: translate(-50%, -50%);
    transition:
        opacity 0.5s,
        visibility 0.5s ease;
    opacity: 1;
    text-align: center;
    padding: 15px;
}

* {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.media-timeline {
    all: initial;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-appearance: none;
    appearance: none;
    font: 16px;
    color: var(--color);
    width: 100%;
    padding: 0;
    outline: none;
    border-radius: 15px;
    height: 2px;
    background: linear-gradient(
        to right,
        var(--color) 0%,
        var(--color) v-bind(audio_percentage),
        var(--slider-base) v-bind(audio_percentage),
        var(--slider-base) 100%
    );
    cursor: pointer;
}
.media-timeline::-webkit-slider-thumb {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-appearance: none;
    appearance: none;
    height: 15px;
    width: 15px;
    background-color: white;
    border-radius: 50%;
    border: none;
    transition: 0.2s ease-in-out;
    box-shadow: 0 1px 5px 1px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.media-timeline::-moz-range-thumb {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-appearance: none;
    appearance: none;
    height: 15px;
    width: 15px;
    background-color: white;
    border-radius: 50%;
    border: none;
    transition: 0.2s ease-in-out;
    box-shadow: 0 1px 5px 1px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}
.broadcast-close-button {
    position: absolute;
    right: 0;
    top: 0;
    margin: 15px;
    cursor: pointer;
}
.timeline {
    width: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
}
.timestamp {
    font-size: small;
    font-weight: bold;
    color: var(--color);
}
.timestamp-left {
    font-size: small;
    font-weight: bold;
    color: var(--color);
    margin-left: 25px;
}
.timestamp-right {
    font-size: small;
    font-weight: bold;
    color: var(--color);
    margin-right: 15px;
}
.progress-bar-value {
    background-color: var(--color);
    width: 0%;
    height: 2px;
    border-radius: 15px;
}
.progress-bar {
    width: 60%;
    margin: 0 10px;
    align-items: center;
    display: flex;
    overflow: visible;
}
.play-button.small {
    max-width: 50px;
    max-height: 50px;
    width: 10vw;
    height: 10vw;
    margin: 0px 10px;
}
.note-container {
    color: var(--color);
    justify-content: center;
    align-items: center;
    text-align: center;
}
.starting-note-icon-all {
    filter: var(--svg-polar);
    width: 8vw;
    height: 8vw;
    max-width: 30px;
    max-height: 30px;
}
.starting-note-icon {
    width: 15vw;
    height: 15vw;
    max-width: 75px;
    max-height: 75px;
    filter: var(--svg-polar);
}
.note-button {
    background-color: var(--song-background);
    color: var(--color);
    border: 1px solid var(--background);
    border-radius: 15px;
    margin: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 15px;
    min-height: 15px;
    width: 15vw;
    height: 15vw;
    max-width: 75px;
    max-height: 75px;
    cursor: pointer;
}
.note-button.small {
    margin: 0px 5px;
    max-width: 60px;
    max-height: 40px;
}
.note-button:active {
    background-color: var(--button-tap);
    border: 1px solid var(--button-tap);
}
.starting-notes-container {
    width: 100%;
    justify-content: center;
    display: flex;
}
.playback-container {
    width: 100%;
    justify-content: center;
    display: flex;
}
.play-button-path {
    fill: var(--color);
    stroke: var(--color);
}
.play-button {
    max-width: 75px;
    max-height: 75px;
    width: 20vw;
    height: 20vw;
    padding: 0px;
    cursor: pointer;
}
.media-panel-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 15px 15px;
}

.media-panel-top-row > :last-child,
.media-panel-top-row > :first-child {
    flex-grow: 1;
    flex-basis: 0;
}
.media-panel-top-row > :last-child {
    display: flex;
    justify-content: flex-end;
}
.media-panel-top-row > :last-child > img {
    cursor: pointer;
    margin-right: 5px;
}

/* Media type indicator */
.media-type {
    background-color: var(--media-type);
    height: 33px;
    border-radius: 25px;
    display: flex;
    flex-shrink: 0;
    cursor: pointer;
}

.media-type-title {
    color: var(--color);
    font-weight: bold;
    font-size: small;
    line-height: 33px;
}

.media-type-indicator {
    height: 33px;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 15px;
}

.media-type-indicator.active {
    background-color: var(--media-type-active);
    padding: 0px 25px;
}

.media-panel-content {
    width: 100%;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 1;
    transition: transform 0.3s ease;
    transform: translateY(0%);
}
.hidden-panel {
    transform: translateY(100%);
}
.media-panel-blur {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: -1;
    background-color: var(--menu-color);
    border-radius: 15px 15px 0px 0px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
}

.broadcast-button-container {
    position: fixed;
    right: 15px;
    top: calc(61.16px + env(safe-area-inset-top) + 15px);
    z-index: 1;
}

.page-button-container {
    position: fixed;
    bottom: 15px;
    z-index: 1;
}

.page-button {
    height: 10vw;
    width: 10vw;
    max-height: 50px;
    max-width: 50px;
    background-color: var(--button-color);
    border-radius: 50px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    transition: transform 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.left {
    left: 15px;
}
.right {
    right: 15px;
}

.middle {
    left: 50%;
    transform: translateX(-50%);
}

.menu-hidden {
    transform: translateY(-100%);
}

.arrow-hidden-left {
    transform: translateX(-200%);
}
.arrow-hidden-down {
    transform: translateY(200%);
}
.arrow-hidden-right {
    transform: translateX(200%);
}
</style>
