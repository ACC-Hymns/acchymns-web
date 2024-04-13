<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { onMounted, ref, computed, onUnmounted, getCurrentInstance, type SVGAttributes, type VNodeRef } from "vue";
import { getSongMetaData } from "@/scripts/book_import";
import { animate, pause_path, play_path } from "@/scripts/morph";
import { useRouter } from "vue-router";
import type { SongList, SongReference } from "@/scripts/types";
import { useNotes } from "@/composables/notes";
import { Toast } from "@capacitor/toast";
import { useCapacitorPreferences } from "@/composables/preferences";
import { useLocalStorage } from "@vueuse/core";
import { interpolate } from "polymorph-js";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CapacitorHttp } from '@capacitor/core';
import { MediaSession } from '@jofr/capacitor-media-session'

const props = defineProps<SongReference>();

const router = useRouter();

const { player, isPlaying } = useNotes();
const notes = ref<string[]>([]);
const song_count = ref<number>(0);

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
const is_bookmarked = computed(() => {
    return -1 != bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
});

const window_height = computed(() => window.innerHeight);
const image_props = computed(() => {
    return {
        book: props.book,
        number: props.number,
    };
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

let audio_source = ref<HTMLAudioElement>();

onMounted(async () => {
    const SONG_METADATA = await getSongMetaData(props.book);
    if (SONG_METADATA != null) {
        notes.value = (SONG_METADATA[props.number]?.notes ?? []).reverse(); // Reverse as we want bass -> soprano
        song_count.value = Object.keys(SONG_METADATA).length;
    }

    audio_source.value = new Audio('https://github.com/ACC-Hymns/acchymns-web/raw/christopher/media-player/public/assets/1.mp3');
    MediaSession.setMetadata({
        title: '1 - Hallelujah, Praise Ye the Lord',
        artwork: [{
            src: 'https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/christopher/offline/public/assets/icons/180x180.png',
            sizes: '180x180',
            type: 'image/png' 
        }],
        artist: "Zion's Harp"
    })
    MediaSession.setActionHandler({
        action: "play"
    }, (details) => {
        audio_source.value?.play();
        MediaSession.setPlaybackState({
            playbackState: "playing"
        })
        morph();
        media_is_playing.value = true;
    })
    MediaSession.setActionHandler({
        action: "pause"
    }, (details) => {
        audio_source.value?.pause();
        MediaSession.setPlaybackState({
            playbackState: "paused"
        })
        morph();
        media_is_playing.value = false;
    })
});

onUnmounted(() => {
    player.stop();
    audio_source.value?.pause();
    audio_source.value = undefined;
    MediaSession.setPlaybackState({
        playbackState: "none"
    })
});

type Coordinate = {
    x: number;
    y: number;
};

let starting_notes_tooltip_status = useLocalStorage<boolean>("starting_notes_tooltip_complete", false);
let tooltip = ref<Element>();
let menu_bar_visible = ref<boolean>(true);
let hide_touch_pos = ref<Coordinate>({ x: 0, y: 0});
let media_starting_notes = ref<boolean>(false);
let media_panel_visible = ref<boolean>(false);
let media_panel_height = ref<number>(0.3);
let media_panel_elastic = ref<boolean>(false);
let media_panel_active = ref<boolean>(false);
let media_is_playing = ref<boolean>(false);
let media_timestamp_elapsed = ref<number>(0);
let media_timestamp_end = ref<number>(0);
let elapsed_timer: number;
const updateTime = async () => {
    media_timestamp_elapsed.value = audio_source.value?.currentTime || 0;
    MediaSession.setPositionState({
        position: audio_source.value?.currentTime || 0,
        duration: audio_source.value?.duration || 0,
        playbackRate: 1.0
    })
    
    if(media_timestamp_elapsed.value >= media_timestamp_end.value) {
        morph();
        media_is_playing.value = false;
        clearInterval(elapsed_timer);
    }
};

async function play() {
    //player.play(notes);
    //hideTooltip();
    media_panel_visible.value = !media_panel_visible.value;
    media_panel_active.value = !media_panel_active.value;
    
    media_timestamp_end.value = audio_source.value?.duration || 0;
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
    isPlaying.value = !media_panel_visible.value;
}

let morphed_path = ref<string>(play_path);

function morph() {
    let path_order = (media_is_playing.value ? [pause_path, play_path] : [play_path, pause_path]);
    let interpolator = interpolate(path_order, {
        addPoints: 0,
        origin: { x: 0, y: 0 },
        optimize: 'fill',
        precision: 0
    })
    animate((path) => {
        morphed_path.value = path;
    }, interpolator);
}

async function playMedia() {
    morph();

    // Play the media
    if(!media_is_playing.value) {
        audio_source.value?.play();
        MediaSession.setPlaybackState({
            playbackState: "playing"
        })

        elapsed_timer = setInterval(() => {
            updateTime();
        }, 1000, 0);
        media_timestamp_elapsed.value = audio_source.value?.currentTime || 0;
    }
    else {
        audio_source.value?.pause();
        MediaSession.setPlaybackState({
            playbackState: "paused"
        })
        clearInterval(elapsed_timer);
    }
    
    media_is_playing.value = !media_is_playing.value;
}
function secondsToTimestamp(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    let remaining_seconds = Math.floor(seconds % 60);
    return `${minutes}:${remaining_seconds < 10 ? '0' : ''}${remaining_seconds}`;
}

let media_panel_start = 0;
let media_panel_previous = 0;
function dragFallOff(x: number) {
    var result = (Math.log(x+0.368)+1)/4;
    return result;
}
function dragStart(e: Event, pageY: number) {
    e.preventDefault();
    media_panel_previous = Number(media_panel_height.value);
    media_panel_start = 1 - (pageY)/window.innerHeight;
}
function drag(e: Event, pageY: number) {
    e.preventDefault();
    media_panel_height.value = dragFallOff((1 - (pageY)/window.innerHeight) - media_panel_start) + media_panel_previous;
    if(media_panel_height.value < 0.1)
        media_panel_height.value = 0.1;
}
function dragEnd(e: Event) {
    e.preventDefault();
    
    if(media_panel_height.value > 0.2)
        media_panel_height.value = 0.3;
    else
        media_panel_height.value = 0.1;

    media_panel_elastic.value = true;
    setTimeout(() => {
        media_panel_elastic.value = false;
    }, 250);
}
function toggleMenu(e: any) {
    menu_bar_visible.value = !menu_bar_visible.value;

    if(media_panel_active.value)
        media_panel_visible.value = menu_bar_visible.value;
}

function traverse_song(num: number) {
    if(num < 1 || num > song_count.value)
        return;
    router.back();
    setTimeout(() => {
        router.push(`/display/${props.book}/${num}`);
    }, 5);
}

</script>

<template>
    <div class="menu" :class="{ 'menu-hidden': !menu_bar_visible}">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>#{{ props.number }}</h1>
            </div>
            <div class="title--right">
                <template v-if="notes.length != 0">
                    <img v-if="!media_panel_visible" @click="play" class="ionicon" src="/assets/musical-notes-outline.svg" />
                    <img v-else class="ionicon" @click="play" src="/assets/musical-notes.svg" />
                    <div v-if:="!starting_notes_tooltip_status" class="tooltip" ref="tooltip" @click="hideTooltip()">
                        <p class="tooltiptext">New! Starting Notes</p>
                    </div>
                </template>

                <img v-if="is_bookmarked" @click="toggleBookmark()" class="ionicon" src="/assets/bookmark.svg" />
                <img v-else @click="toggleBookmark()" class="ionicon" src="/assets/bookmark-outline.svg" />
            </div>
        </div>
    </div>
    <div class="page-buttons" :style="{transform: 'translateY(' + (media_panel_visible ? (-media_panel_height * window_height + 'px') : '0') + ')'}">
        <div class="page-button" :class="{ 'arrow-hidden-left': (!menu_bar_visible || Number(props.number) == 1)}">
            <img @click="traverse_song(Number(props.number) - 1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
        </div>
        <div class="page-button" :class="{ 'arrow-hidden-right': (!menu_bar_visible || Number(props.number) == song_count)}">
            <img @click="traverse_song(Number(props.number) + 1)" class="ionicon" src="/assets/chevron-forward-outline.svg" />
        </div>
    </div>
    <div class="media-panel" :class="{ 'hidden-panel': !media_panel_visible, elastic: media_panel_elastic}" :style="'height:' + (media_panel_height * 100) + '%'"></div>
    <div class="media-panel-content" :class="{ 'hidden-panel': !media_panel_visible, elastic: media_panel_elastic}" :style="'height:' + (media_panel_height * 100) + '%'">   
        <div class="handle-bar-container" @mousedown="(e) => dragStart(e, e.pageY)" @mousemove="(e) => drag(e, e.pageY)" @mouseup="(e) => dragEnd(e)" @touchstart="(e) => dragStart(e, e.touches[0].pageY)" @touchmove="(e) => drag(e, e.touches[0].pageY)" @touchend="(e) => dragEnd(e)">
            <div class="handle-bar"></div>
        </div>
        <div class="mini-playback-container" v-if="media_panel_height <= 0.15" :style="{ opacity: (media_panel_height <= 0.1) ? '1' : '0'}">
            <p class="timestamp">{{ secondsToTimestamp(media_timestamp_elapsed) }}</p>
            <div class="progress-bar">
                <div class="progress-bar-value" :style="{ width: (media_timestamp_elapsed/media_timestamp_end*100) + '%'}"></div>
            </div>
            <p class="timestamp">{{ secondsToTimestamp(media_timestamp_end) }}</p>
            <svg @click="playMedia()" class="mini-play-button" viewBox="0 0 512 512">
                <path id="svg_content" class="play-button-path" :d="morphed_path"></path>
            </svg>
        </div>
        <div class="media-type" :style="{ opacity: (media_panel_height < 0.2) ? '0' : '1'}">
            <div :class="!media_starting_notes ? 'media-type-indicator-active' : 'media-type-indicator'" @click="(e) => setMediaPanel(e, false)" @touchstart="(e) => setMediaPanel(e, false)">
                <p class="media-type-title">Piano</p>           
            </div>
            <div :class="media_starting_notes ? 'media-type-indicator-active' : 'media-type-indicator'" @click="(e) => setMediaPanel(e, true)" @touchstart="(e) => setMediaPanel(e, true)">
                <p class="media-type-title">Starting Notes</p>           
            </div>
        </div>
        <div class="media-controls" v-if="!media_starting_notes">
            <div class="playback-container" :style="{ opacity: (media_panel_height < 0.25) ? '0' : '1'}">
                <svg @click="playMedia()" class="play-button" viewBox="0 0 512 512">
                    <path id="svg_content" class="play-button-path" :d="morphed_path"></path>
                </svg>
            </div>
            <div class="timeline" :style="{ opacity: (media_panel_height < 0.3) ? '0' : '1'}">
                <p class="timestamp">{{ secondsToTimestamp(media_timestamp_elapsed) }}</p>
                <div class="progress-bar">
                    <div class="progress-bar-value" :style="{ width: (media_timestamp_elapsed/media_timestamp_end*100) + '%'}"></div>
                </div>
                <p class="timestamp">{{ secondsToTimestamp(media_timestamp_end) }}</p>
            </div>
            
            
        </div>
        
    </div>
    
    <div class="w-100" style="height: 100vh" @mousedown="(e) => hide_touch_pos = {x: e.screenX, y: e.screenY}" 
        @mouseup="(e) => {
            if(Math.abs(hide_touch_pos.x - e.screenX) < 5 && Math.abs(hide_touch_pos.y - e.screenY) < 5)
                toggleMenu(e)
        }" @touchstart="(e) => hide_touch_pos = {x: e.touches[0].screenX, y: e.touches[0].screenY}" 
        @touchend="(e) => {
            if(Math.abs(hide_touch_pos.x - e.changedTouches[0].screenX) < 5 && Math.abs(hide_touch_pos.y - e.changedTouches[0].screenY) < 5)
                toggleMenu(e)
        }"
    >
        <SongContainer :book="image_props.book" :number="image_props.number"></SongContainer>
    </div>
    
</template>

<style>
.timeline {
    width: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    transition: opacity 0.25s ease-in;
}
.timestamp {
    font-size: small;
    font-weight: bold;
    color: var(--color);
}
.progress-bar-value {
    background-color: #000000;
    width: 0%;
    height: 2px;
    border-radius: 15px;
}
.progress-bar {
    background-color: #D8D8D8;
    width: 50%;
    height: 2px;
    border-radius: 15px;
    margin: 0 10px;
}
.mini-playback-container {
    width: 100%;
    justify-content: right;
    display: flex;
    align-items: center;
    transition: opacity 0.25s ease-in;
    transform: translateY(-2vh);
}
.mini-play-button {
    max-width: 50px;
    max-height: 50px;
    width: 10vw;
    height: 10vw;
    margin: 0 15px;
}
.playback-container {
    width: 100%;
    justify-content: center;
    display: flex;
    transition: opacity 0.25s ease-in;
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
    margin: 0 auto;
}
.page-buttons {
    position: fixed;
    bottom: 5vh;
    z-index: 1;
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.page-button {
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
    transition: opacity 0.25s ease-in;
}
.handle-bar-container {
    width: 100%;
    height: 20px;
    transform: translateY(-2vh);
}
.handle-bar {
    background-color: #818181;
    width: 50px;
    height: 2px;
    border-radius: 15px;
    margin: 10px auto;
    transform: translateY(2vh);
}
.media-panel-content {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 1;
    transition: opacity 0.125s ease-in, visibility 0.125s ease;
    opacity: 1;
    visibility: visible;
}
.media-panel {
    width: 100%;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background-color: var(--menu-color);
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 1;
    border-radius: 15px 15px 0px 0px;
    transition: opacity 0.125s ease-in, visibility 0.125s ease;
    opacity: 1;
    visibility: visible;
}
.elastic {
    transition: height 0.0625s ease-out;
}
.hidden-panel {
    opacity: 0;
    visibility: hidden;
}

.menu-hidden {
    transform: translateY(-100%);
}
.arrow-hidden-left {
    transform: translateX(-150%);
}
.arrow-hidden-right {
    transform: translateX(150%);
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
