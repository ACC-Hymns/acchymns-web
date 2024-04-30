<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData } from "@/scripts/book_import";
import { RouterLink, useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { useLocalStorage, useSessionStorage } from "@vueuse/core";
import { saveScrollPosition, restoreScrollPosition } from "@/router/scroll";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();
const route = useRoute();

// Saving position in book
onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
});

let topical_index_tooltip_status = useLocalStorage<boolean>("topical_index_tooltip_complete", false);

const error_active = ref(false);

const song_numbers = ref<string[]>([]);
let book_name = ref("");
let index_available = ref(false);
let button_color = ref("#000000");
let tooltip = ref<Element>();
let song_number_groups = ref<string[][]>([]);
let song_number_groups_active = ref<string[][]>([]);
let song_group_elements = ref<any[]>()
let song_group_enabled = useLocalStorage<boolean>("ACCOptions.songGroupEnabled", false);

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songs = await getSongMetaData(props.book);

    if (songs == null) {
        error_active.value = true;
        return;
    }
    song_numbers.value = Object.keys(songs).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

    let song_count = song_numbers.value.length;
    let num_groups = Math.ceil(song_count/100);
    if (song_count % 100 == 0) {
        num_groups += 1;
    }

    // Dividing songs into groups of 100
    for (let i = 0; i < num_groups; i++) {
        song_number_groups.value?.push(song_numbers.value.filter((song) => {
            const re = new RegExp(/[a-z]/, "i");
            let song_num = song.replace(re, "");

            if (Number(song_num) >= i*100 && Number(song_num) < ((i+1)*100)) {
                return true;
            }

            return false;
        }));
    }

    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
    index_available.value = BOOK_METADATA[props.book].indexAvailable;

    useSessionStorage<boolean>("isAlphabetical", false).value = false;

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
});

function toggleDropdown(group: string[]) {
    if (song_number_groups_active.value.includes(group)) {
        song_number_groups_active.value = [];
    } else {
        song_number_groups_active.value = [];
        song_number_groups_active.value.push(group);
        var index = song_number_groups.value.indexOf(group);
        if (song_group_elements.value == undefined) {
            return;
        }
        let element = song_group_elements.value[index] as HTMLElement;
        setTimeout(() => {
            scrollIntoViewWithOffset(element, 0);
        }, 200)
    }
}

const scrollIntoViewWithOffset = (selector: HTMLElement, offset: number) => {
    window.scrollTo({
        behavior: 'smooth',
        top:
        selector.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        offset,
    })
}

function getRangeString(start: string, end: string) {
    if (start == end) {
        return start;
    } else {
        return `${start} - ${end}`;
    }
}

function hideTooltip() {
    tooltip.value?.classList.add("tooltiphidden");
    tooltip.value?.classList.add("tooltip");
    setTimeout(() => {
        topical_index_tooltip_status.value = true;
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
                <h1>{{ error_active ? "Unavailable" : book_name }}</h1>
            </div>
            <div class="title--right">
                <div @click="hideTooltip">
                    <RouterLink v-if="index_available" :to="`/topical/${props.book}`" @click="topical_index_tooltip_status = true">
                        <img class="ionicon" src="/assets/book-outline.svg" />
                    </RouterLink>
                    <div v-if:="!topical_index_tooltip_status && index_available" class="tooltip" ref="tooltip">
                        <p class="tooltiptext">New! Topical Index</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="error_active" class="fallback-container">
        <img class="wifi-fallback" src="/assets/wifi_off.svg" />
    </div>
    <div v-else class="songs main-content">
        <!-- Buttons with song grouping disabled -->
        <div v-if="!song_group_enabled" class="song-button-container">
            <RouterLink v-for="song_num in song_numbers" :key="song_num" :to="`/display/${props.book}/${song_num}`" class="song-btn" :style="{ background: button_color }">
                            {{ song_num }}
            </RouterLink>
        </div>
        <!-- Buttons with song grouping enabled -->
        <div v-else @click="toggleDropdown(group)" v-for="group in song_number_groups" class="song-group-container" ref="song_group_elements">
            <div>
                <div class="song-group-title-container">
                    <div class="song-title">{{getRangeString(group[0], group[group.length - 1])}}</div>
                    <img class="ionicon nav__icon dropdown-icon" src="/assets/chevron-back-outline.svg" :class="{'dropdown-icon-active': song_number_groups_active.includes(group)}"/>
                </div>
                <div class="wrapper" :class="{'wrapper-active': song_number_groups_active.includes(group)}">
                    <div class="song-button-container" :class="{'song-button-container-active': song_number_groups_active.includes(group)}">
                        <RouterLink v-for="song_num in group" :key="song_num" :to="`/display/${props.book}/${song_num}`" class="song-btn" :style="{ background: button_color }">
                            {{ song_num }}
                        </RouterLink>
                    </div>     
                </div>     
                
            </div>
            
        </div>
    </div>

    <nav class="nav">
        <RouterLink to="/" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/home.svg" />
            <span class="nav__text">Home</span>
        </RouterLink>
        <RouterLink to="/search" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </RouterLink>
        <RouterLink to="/bookmarks" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
            <span class="nav__text">Bookmarks</span>
        </RouterLink>
        <RouterLink to="/settings" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style scoped>

.songs {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0px 15px 50px 15px;
}

.song-group-container {
    /*border: 1px solid #bebebe;*/
    box-shadow: var(--thin-shadow);
    background-color: var(--button-color);
    border-radius: 15px;
}

.song-group-title-container{
    margin: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.song-title {
    text-decoration: none;
    color: var(--color);
    font-weight: 400;
}

.dropdown-icon {
    transition: rotate ease-out 0.4s;
    transform: translateX(-3px);
    rotate: calc(-90deg);
}

.dropdown-icon-active {
    transition: rotate ease-out 0.4s;
    transform: translateX(3px);
    rotate: calc(90deg);
}

.wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s;
}

.wrapper-active {
    grid-template-rows: 1fr;
}

.song-button-container {
    padding-left: 10px;
    padding-right: 10px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.song-button-container-active {
    padding-bottom: 20px;
}

.song-btn {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    color: #fff;
    font-weight: 900;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
}

.tooltip {
    min-width: 150px;
    height: 25px;
    background-color: #2196f3;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.25);
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    translate: -105px 10px;
    opacity: 1;
}

.tooltiphidden {
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
    left: 75%;
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

.wifi-fallback {
    filter: var(--svg-back-filter);
    display: block;
    width: 50%;
    z-index: -1;
}

.fallback-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>
