<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { bass_note_icons, treble_note_icons } from "@/composables/notes";
import { onMounted, ref, computed, onUnmounted } from "vue";
import { getSongMetaData, getAllBookMetaData } from "@/scripts/book_import";
import { animate, pause_path, play_path } from "@/scripts/morph";
import { useRouter } from "vue-router";
import type { SongList, SongReference } from "@/scripts/types";
import { useNotes } from "@/composables/notes";
import { Toast } from "@capacitor/toast";
import { useCapacitorPreferences } from "@/composables/preferences";
import { useLocalStorage } from "@vueuse/core";
import { interpolate } from "polymorph-js";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { branch } from "@/scripts/constants";
import { Network } from "@capacitor/network";
import { ScreenOrientation } from '@capacitor/screen-orientation';
//import { navigator.mediaSession } from '@jofr/capacitor-media-session';

const props = defineProps<SongReference>();

const router = useRouter();

const { player, isPlaying } = useNotes();
const notes = ref<string[]>([]);
const song_count = ref<number>(0);
var isMobile = true//Capacitor.getPlatform() !== "web";

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
const is_bookmarked = computed(() => {
    return -1 != bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
});

const isLandscape = ref<boolean>(false);
const window_height = () => window.innerHeight;
const window_width = () => window.innerWidth;
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
class DraggablePanel {
    start: number;
    previous: number;
    height: number;
    visible: boolean;
    elastic: boolean;
    background_blur: boolean;

    constructor() {
        this.start = 0;
        this.previous = 0;
        this.visible = false;
        this.elastic = false;
        this.background_blur = true;
        this.height = (screen.orientation.type.includes("landscape")) ? 0.8 : 0.4;
    }
    dragFallOff(x: number) {
        var result = (Math.log(x + 0.368) + 1) / 4;
        return result;
    }
    dragStart(e: Event, pageY: number) {
        e.preventDefault();
        this.previous = this.height;
        this.start = 1 - pageY / window.innerHeight;
    }
    drag(e: Event, pageY: number) {
        e.preventDefault();
        this.height = this.dragFallOff((1 - pageY / window.innerHeight) - this.start) + this.previous;
        if (this.height < (isLandscape.value ? 0.2 : 0.1) || isNaN(this.height))
        this.height = (isLandscape.value ? 0.2 : 0.1);
    }
    dragEnd(e: Event) {
        e.preventDefault();
        if (this.height > (isLandscape.value ? 0.4 : 0.2))
            this.height = (isLandscape.value ? 0.8 : 0.4);
        else {
            if (media_starting_notes.value && media_is_playing.value == false) {
                this.height = 0;
                media_panel_active.value = false;
                this.visible = false;
            } else {
                this.height = (isLandscape.value ? 0.2 : 0.1);
            }
        }
        this.elastic = true;
        setTimeout(() => {
            this.elastic = false;
        }, 250);
    }

}

type Coordinate = {
    x: number;
    y: number;
};

let panel = ref<DraggablePanel>(new DraggablePanel());
let audio_source = ref<HTMLAudioElement>();
let audio_source_exists = ref<boolean>(false);
let previous_orientation = "";

onMounted(async () => {
    const SONG_METADATA = await getSongMetaData(props.book);
    const BOOK_METADATA = await getAllBookMetaData();
    
    if(SONG_METADATA != null) {
        const song_data = SONG_METADATA[props.number];
        notes.value = (song_data?.notes ?? []).reverse(); // Reverse as we want bass -> soprano
        song_count.value = Object.keys(SONG_METADATA).length;

        audio_source.value = new Audio(`https://acchymnsmedia.s3.us-east-2.amazonaws.com/${props.book}/${props.number}.mp3`,);
        audio_source.value.preload = 'metadata';
        if(!(await Network.getStatus()).connected) audio_source_exists.value = false;
        setMediaPanel(null, true);
        audio_source.value.addEventListener('loadedmetadata', () => {
            console.log("Audio Loaded!");
            audio_source_exists.value = true;
            media_timestamp_end.value = audio_source.value?.duration || 0;
            navigator.mediaSession.setPositionState({
                position: audio_source.value?.currentTime || 0,
                duration: audio_source.value?.duration || 0,
                playbackRate: 1.0
            })
            setMediaPanel(null, false);
        })
        Network.addListener("networkStatusChange", async (details) => {
            if(!(await Network.getStatus()).connected) {
                audio_source_exists.value = false;
                audio_source.value?.load();
            }
        })
        audio_source.value.addEventListener('error', () => {
            console.error("Error loading audio");
            audio_source_exists.value = false;
            setMediaPanel(null, true);
        });
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${props.number} - ${song_data.title}`,
            artwork: [{
                src: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/public/assets/icons/180x180.png`,
                sizes: '180x180',
                type: 'image/png' 
            }],
            artist: BOOK_METADATA[props.book].name.medium
        })
        navigator.mediaSession.setActionHandler("play", (details) => {
            audio_source.value?.play();
            navigator.mediaSession.playbackState = 'playing';
            morph();
            media_is_playing.value = true;
        })
        navigator.mediaSession.setActionHandler('stop', (details) => {
            audio_source.value?.pause();
            navigator.mediaSession.playbackState = 'paused';
            morph();
            media_is_playing.value = false;
        })
        navigator.mediaSession.setActionHandler("pause", (details) => {
            audio_source.value?.pause();
            navigator.mediaSession.playbackState = 'paused';
            morph();
            media_is_playing.value = false;
        })
        navigator.mediaSession.setActionHandler("seekbackward", (details) => {
            let percentage = Math.max(0, media_timestamp_elapsed.value - 10)/media_timestamp_end.value * 100;
            console.log(percentage);
            set_audio_position(percentage);
        })
        navigator.mediaSession.setActionHandler("seekforward", (details) => {
            let percentage = Math.min(media_timestamp_end.value, media_timestamp_elapsed.value + 10)/media_timestamp_end.value * 100;
            console.log(percentage);
            set_audio_position(percentage);
        })
        navigator.mediaSession.setActionHandler("previoustrack", (details) => {
            traverse_song(-1);
        })
        navigator.mediaSession.setActionHandler("nexttrack", (details) => {
            traverse_song(1);
        })
        navigator.mediaSession.setActionHandler("seekto", (details) => {
            set_audio_position((details?.seekTime || 0)/media_timestamp_end.value * 100);
        })
    }

    previous_orientation = (await ScreenOrientation.orientation()).type;
    if((await ScreenOrientation.orientation()).type == 'portrait-primary') {
        isLandscape.value = false;
    } else if((await ScreenOrientation.orientation()).type.includes('landscape')) {
        isLandscape.value = true;
    }
    ScreenOrientation.addListener('screenOrientationChange', async () => {
        if(previous_orientation == (await ScreenOrientation.orientation()).type)
            return;
        if((await ScreenOrientation.orientation()).type == 'portrait-primary') {
            isLandscape.value = false;
            previous_orientation = (await ScreenOrientation.orientation()).type;

            if(!media_starting_notes.value)
                panel.value.height = (isLandscape.value) ? 0.2 : 0.1;
            else
                panel.value.height = (isLandscape.value) ? 0.8 : 0.4;
        } else if((await ScreenOrientation.orientation()).type.includes('landscape')) {
            isLandscape.value = true;
            previous_orientation = (await ScreenOrientation.orientation()).type;
            if(!media_starting_notes.value)
                panel.value.height = (isLandscape.value) ? 0.2 : 0.1;
            else
                panel.value.height = (isLandscape.value) ? 0.8 : 0.4;
        }
    });
});

onUnmounted(() => {
    player.stop();
    audio_source.value?.pause();
    audio_source.value = undefined;
    navigator.mediaSession.playbackState = 'none';
});


let menu_bar_visible = ref<boolean>(true);
let hide_touch_pos = ref<Coordinate>({ x: 0, y: 0});
let media_starting_notes = ref<boolean>(false);
let media_panel_active = ref<boolean>(false);
let media_is_playing = ref<boolean>(false);
let media_timestamp_elapsed = ref<number>(0);
let media_timestamp_end = ref<number>(0);
let elapsed_timer: number;
let media_is_scrubbing = ref<boolean>(false);
let large_timeline = ref();
let mini_timeline = ref();
let page_buttons = ref();


const updateTime = async () => {
    media_timestamp_elapsed.value = audio_source.value?.currentTime || 0;
    
    if(audio_source.value == undefined)
        return;
    let lt = large_timeline.value as HTMLInputElement;
    let mt = mini_timeline.value as HTMLInputElement;
    let percentage = audio_source.value.currentTime/audio_source.value.duration*100;
    if(lt) lt.style.background = `linear-gradient(to right, var(--color) 0%, var(--color) ${percentage}%, var(--slider-base) ${percentage}%, var(--slider-base) 100%)`;
    if(mt) mt.style.background = `linear-gradient(to right, var(--color) 0%, var(--color) ${percentage}%, var(--slider-base) ${percentage}%, var(--slider-base) 100%)`;
    
    if(audio_source.value.ended && media_is_scrubbing.value == false) {
        morph();
        media_is_playing.value = false;
        clearInterval(elapsed_timer);
    }
};

async function play_all_notes() {
    player.stop();
    player.play(notes);
}
async function play_note(note: string) {
    player.stop();
    player.play([note]);
}

async function toggle_media_panel() {
    media_panel_active.value = !media_panel_active.value;
    panel.value.visible = media_panel_active.value;
    panel.value.height = isLandscape.value ? 0.8 : 0.4;

    panel.value.background_blur = false;
    setTimeout(() => {
        panel.value.background_blur = true;
    }, 250);
}


function setMediaPanel(event: any, value: boolean) {
    if(event) event.preventDefault();
    media_starting_notes.value = value;
    isPlaying.value = !panel.value.visible;
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
        navigator.mediaSession.playbackState = 'playing'

        updateTime()
        elapsed_timer = setInterval(() => {
            updateTime();
        }, 1000, 0);
        media_timestamp_elapsed.value = audio_source.value?.currentTime || 0;
    }
    else {
        audio_source.value?.pause();
        navigator.mediaSession.playbackState = 'paused'
        clearInterval(elapsed_timer);
    }

    media_is_playing.value = !media_is_playing.value;
}

function release_audio_position(e: Event) {
    media_is_scrubbing.value = false;
    if(media_is_playing.value && audio_source.value?.paused && !audio_source.value?.ended)
        audio_source.value?.play();
}

function set_audio_position(percentage: number) {
    media_is_scrubbing.value = true;
    let source = audio_source.value;
    if(source == undefined)
        return;
    source.currentTime = source.duration * percentage/100;
    navigator.mediaSession.setPositionState({
        position: audio_source.value?.currentTime || 0,
        duration: audio_source.value?.duration || 0,
        playbackRate: 1.0
    })

    updateTime();
}

function secondsToTimestamp(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    let remaining_seconds = Math.floor(seconds % 60);
    return `${minutes}:${remaining_seconds < 10 ? '0' : ''}${remaining_seconds}`;
}

function toggleMenu(e: any) {
    menu_bar_visible.value = !menu_bar_visible.value;

    if(media_panel_active.value)
        panel.value.visible = menu_bar_visible.value;
}

function hideMedia() {
    if(audio_source_exists.value == false) {
        panel.value.height = 0;
        panel.value.elastic = true;
        setTimeout(() => {
            panel.value.elastic = false;
            panel.value.visible = false;
            media_panel_active.value = false;
        }, 250);
        return;
    }

    panel.value.height = (isLandscape.value ? 0.2 : 0.1);
    panel.value.elastic = true;
    setTimeout(() => {
        panel.value.elastic = false;
    }, 250);
}

async function traverse_song(dir: number) {
    const SONG_METADATA = await getSongMetaData(props.book);
    
    let num = '0';
    if(SONG_METADATA == null) {
        console.error("Error loading song metadata. Cannot traverse song.");
        return;
    } else {
        let song_numbers = Object.keys(SONG_METADATA).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
        let index = song_numbers.findIndex(song => song == props.number);
        if(index == -1) {
            console.error("Error finding song in metadata. Cannot traverse song.");
            return;
        }
        if(index + dir < 0 || index + dir >= song_numbers.length) {
            console.error("Cannot traverse song. Out of bounds.");
            return;
        }
        num = song_numbers[index + dir];
    }

    await router.replace(window.history.state.back);
    await router.replace(`/display/${props.book}/${num}`);
}

function get_note_icon(note: string) {
    let modified_note = note.replace('#', '').replace('b', '');
    
    if(notes.value.indexOf(note) > 1 || !Object.keys(bass_note_icons).includes(modified_note))
        return treble_note_icons[modified_note];
    return bass_note_icons[modified_note];
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
                    <img v-if="!panel.visible" @click="toggle_media_panel()" class="ionicon" src="/assets/musical-notes-outline.svg" />
                    <img v-else class="ionicon" @click="toggle_media_panel()" src="/assets/musical-notes.svg" />
                </template>

                <img v-if="is_bookmarked" @click="toggleBookmark()" class="ionicon" src="/assets/bookmark.svg" />
                <img v-else @click="toggleBookmark()" class="ionicon" src="/assets/bookmark-outline.svg" />
            </div>
        </div>
    </div>
    <div ref="page_buttons" v-if="panel.height < 0.7 || !panel.visible" class="page-buttons" :style="{transform: 'translateY(' + (panel.visible ? (-panel.height * window_height() + 'px') : '0') + ')'}">
        <div class="page-button" :class="{ 'arrow-hidden-left': (!menu_bar_visible || Number(props.number) == 1)}">
            <img @click="traverse_song(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
        </div>
        <div class="page-button" :class="{ 'arrow-hidden-right': (!menu_bar_visible || Number(props.number) == song_count)}">
            <img @click="traverse_song(1)" class="ionicon" src="/assets/chevron-forward-outline.svg" />
        </div>
    </div>
    <div class="media-panel" :class="{ 'hidden-panel': !panel.visible, elastic: panel.elastic, 'media-panel-blur': panel.background_blur}" :style="'height:' + (panel.height * 100) + '%'"></div>
    <div class="media-panel-content" :class="{ 'hidden-panel': !panel.visible, elastic: panel.elastic}" :style="'height:' + (panel.height * 100) + '%'">   
        <div class="handle-bar-container" v-if="isMobile" @touchstart="(e) => panel.dragStart(e, e.touches[0].pageY)" @touchmove="(e) => panel.drag(e, e.touches[0].pageY)" @touchend="(e) => panel.dragEnd(e)">
            <div class="handle-bar"></div>
        </div>
        <div class="close-button" :style="{ opacity: (panel.height < (isLandscape ? 0.3 : 0.15) ? '0' : '1')}">
            <img @click="toggle_media_panel()" class="ionicon" src="/assets/close.svg" />
        </div>
        <div v-if="panel.height <= (isLandscape ? 0.3 : 0.15) && panel.visible && audio_source_exists" class="mini-playback-container" :style="{ opacity: (panel.height <= (isLandscape ? 0.2 : 0.1)) ? '1' : '0'}">
            <p class="timestamp-left">{{ secondsToTimestamp(media_timestamp_elapsed) }}</p>
            <div class="progress-bar">
                <input type="range" ref="mini_timeline" class="media-timeline" :value="media_timestamp_elapsed/media_timestamp_end*100" :onInput="(e) => set_audio_position(Number((e.target as HTMLInputElement).value))" @change="(e) => release_audio_position(e)" :style="{background: `linear-gradient(to right, var(--color) 0%, var(--color) ${media_timestamp_elapsed/media_timestamp_end*100}%, var(--slider-base) ${media_timestamp_elapsed/media_timestamp_end*100}%, var(--slider-base) 100%)`}">
            </div>
            <p class="timestamp-right">{{ secondsToTimestamp(media_timestamp_end) }}</p>
            <svg @click="playMedia()" class="mini-play-button" viewBox="0 0 512 512">
                <path id="svg_content" class="play-button-path" :d="morphed_path"></path>
            </svg>
        </div>
        <div class="media-type" :style="{ opacity: (panel.height < (isLandscape ? 0.4 : 0.2)) ? '0' : '1'}">
            <div v-if="audio_source_exists" :class="!media_starting_notes ? 'media-type-indicator-active' : 'media-type-indicator'" @click="(e) => setMediaPanel(e, false)" @touchstart="(e) => setMediaPanel(e, false)">
                <p class="media-type-title">Piano</p>           
            </div>
            <div :class="media_starting_notes ? 'media-type-indicator-active' : 'media-type-indicator'" @click="(e) => setMediaPanel(e, true)" @touchstart="(e) => setMediaPanel(e, true)">
                <p class="media-type-title">Starting Notes</p>
            </div>
        </div>
        <div v-if="!media_starting_notes && panel.visible" class="media-controls">
            <div class="playback-container" :style="{ opacity: (panel.height < (isLandscape ? 0.5 : 0.25)) ? '0' : '1'}">
                <svg @click="playMedia()" class="play-button" viewBox="0 0 512 512">
                    <path id="svg_content" class="play-button-path" :d="morphed_path"></path>
                </svg>
            </div>
            <div class="timeline" :style="{ opacity: (panel.height < (isLandscape ? 0.8 : 0.4)) ? '0' : '1'}">
                <p class="timestamp">{{ secondsToTimestamp(media_timestamp_elapsed) }}</p>
                <div class="progress-bar-large">
                    <input type="range" ref="large_timeline" class="media-timeline" :value="media_timestamp_elapsed/media_timestamp_end*100" :onInput="(e) => set_audio_position(Number((e.target as HTMLInputElement).value))" @change="(e) => release_audio_position(e)" :style="{background: `linear-gradient(to right, var(--color) 0%, var(--color) ${media_timestamp_elapsed/media_timestamp_end*100}%, var(--slider-base) ${media_timestamp_elapsed/media_timestamp_end*100}%, var(--slider-base) 100%)`}">
                </div>
                <p class="timestamp">{{ secondsToTimestamp(media_timestamp_end) }}</p>
            </div>
        </div>
        <div v-else class="starting-notes-container">
            <div class="note-container">
                <div class="note-button" @click="play_all_notes()">
                    <img class="ionicon starting-note-icon-all" src="/assets/musical-notes.svg" />
                </div>
                <p class="note-name">All</p>
            </div>
            <div v-for="note in notes" :key="note" class="note-container" @click="play_note(note)">
                <div class="note-button">
                    <img class="ionicon starting-note-icon" :src="get_note_icon(note)" />
                </div>
                <p class="note-name">{{ note }}</p>
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

        @touchmove="(e) => {
            hideMedia()
        }"
    >
        <SongContainer :book="image_props.book" :number="image_props.number"></SongContainer>
    </div>
    
</template>

<style>
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
    background: var(--slider-base);
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
    transition: .2s ease-in-out;
    box-shadow: 0 1px 5px 1px rgba(0,0,0,0.5);
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
    transition: .2s ease-in-out;
    box-shadow: 0 1px 5px 1px rgba(0,0,0,0.5);
}
.close-button {
    position: absolute;
    right: 0;
    top: 0;
    margin: 15px;
    transition: opacity 0.25s ease-in;
}
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
    width: 50%;
    margin: 0 10px;
    align-items: center;
    display: flex;
}
.progress-bar-large {
    width: 60%;
    margin: 0 10px;
    align-items: center;
    display: flex;
}
.mini-playback-container {
    width: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    transition: opacity 0.25s ease-in;
    margin: 15px 0;
}
.mini-play-button {
    max-width: 50px;
    max-height: 50px;
    width: 10vw;
    height: 10vw;
    margin-right: 15px;
}
.note-name {
    color: var(--color);
}
.note-container {
    justify-content: center;
    align-items: center;
    text-align: center
}
.starting-note-icon-all {
    filter: var(--svg-polar);
    width: 8vw;
    height: 8vw;
    max-width: 50px;
    max-height: 50px;
}
.starting-note-icon {
    width: 15vw;
    height: 15vw;
    max-width: 100px;
    max-height: 100px;
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
    max-width: 100px;
    max-height: 100px;
}
.starting-notes-container {
    width: 100%;
    justify-content: center;
    display: flex;
    transition: opacity 0.25s ease-in;
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
    margin: 0 15px;
    transition: transform 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.media-type-title  {
    margin: 0px  0px;
    color: var(--color);
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
    background-color: var(--media-type-active);
    height: 33px;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 25px;
}
.media-type {
    background-color: var(--media-type);;
    width: max-content;
    height: 35px;
    border-radius: 15px;
    margin: 45px auto;
    display: flex;
    justify-content:space-between;
    align-items: center;
    padding: 0px 1px;
    transition: opacity 0.25s ease-in;
}
.handle-bar-container {
    width: 100%;
    height: 40px;
    position: absolute;
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
.media-panel-blur {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}
.media-panel {
    width: 100%;
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
    transform: translateX(-200%);
}
.arrow-hidden-right {
    transform: translateX(200%);
}
</style>
