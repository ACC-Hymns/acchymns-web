<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

let landing_complete = useLocalStorage<boolean>("update3showcase", false);

let is_scrolling = ref<boolean>(false);
let scroll_index = ref<number>(0);
let scroll_target = ref<HTMLElement>();

const isDarkMode = ref<boolean>(false);
const BASE_URL = import.meta.env.BASE_URL;

let change_headers = ref<string[]>(["Customization", "Download for Later", "Media Player"]);
let change_details = ref<string[]>([
    "Rearrange the home page to look the way you want it to.",
    "Download hymnals for later use without needing an internet connection.",
    "Sing along with the piano using the media player. Currently only available on certain hymnals.",
]);

onMounted(() => {
    isDarkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
        isDarkMode.value = event.matches;
    });
});

function scrollHandler(e: UIEvent) {
    let target = e.target as HTMLElement;
    let scroll_percentage = target.scrollLeft / target.offsetWidth;
    let nearest_index = Math.round(scroll_percentage);
    let distance = Math.min(Math.abs(nearest_index - scroll_percentage), 1);
    is_scrolling.value = distance > 0.2;
    scroll_index.value = nearest_index;
}

function exit() {
    landing_complete.value = true;
}

function scroll_to_index(index: number) {
    if (scroll_target.value == undefined) return;
    scroll_target.value.scrollTo({
        left: scroll_target.value.offsetWidth * index,
        behavior: "smooth",
    });
}

function action() {
    if (scroll_index.value == change_headers.value.length - 1) {
        exit();
    } else {
        scroll_to_index(scroll_index.value + 1);
    }
}

function active(selected: boolean) {
    if (selected) {
        return BASE_URL + "assets/ellipse.svg";
    } else {
        return BASE_URL + "assets/ellipse-outline.svg";
    }
}

function compute_dark_mode(s1: string, s2: string, dark_mode: boolean) {
    return dark_mode ? s2 : s1;
}
</script>

<template>
    <div class="fill">
        <div class="welcome-page">
            <div class="swipe-view" @scroll="e => scrollHandler(e)" ref="scroll_target">
                <section>
                    <img
                        class="demo-image demo-image-border"
                        :src="compute_dark_mode(BASE_URL + 'assets/demos/rearrange.gif', BASE_URL + 'assets/demos/rearrange-dark.gif', isDarkMode)"
                    />
                </section>
                <section>
                    <img
                        class="demo-image demo-image-border"
                        :src="compute_dark_mode(BASE_URL + 'assets/demos/download.gif', BASE_URL + 'assets/demos/download-dark.gif', isDarkMode)"
                    />
                </section>
                <section>
                    <img
                        class="demo-image demo-image-border"
                        :src="
                            compute_dark_mode(BASE_URL + 'assets/demos/mediaplayer.png', BASE_URL + 'assets/demos/mediaplayer-dark.png', isDarkMode)
                        "
                    />
                </section>
            </div>
        </div>
        <div class="bottom-container">
            <div class="progress">
                <img v-for="index in 3" class="ionicon progress-icon" :src="active(scroll_index == index - 1)" @click="scroll_to_index(index - 1)" />
            </div>
            <div class="details">
                <h1 class="change-header" :class="{ 'scrolling-text': is_scrolling }">{{ change_headers[scroll_index] }}</h1>
                <p class="change-details" :class="{ 'scrolling-text': is_scrolling }">{{ change_details[scroll_index] }}</p>
            </div>
            <a class="start-button" @click="action">
                <p class="song__title">{{ scroll_index == change_headers.length - 1 ? "Continue" : "Next" }}</p>
            </a>
        </div>
    </div>
</template>

<style scoped>
@import "@/assets/css/song.css";
.bottom-container {
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: absolute;
    bottom: 0;
    height: 50%;
    width: 100%;
    border-radius: 15px;
    background-color: var(--button-color);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    z-index: 2;
    margin-top: 15px;
}
.progress {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    margin: 0;
    padding: 30px 0 10px 0;
}
.progress-icon {
    width: 10px;
    height: 10px;
    margin: 0 4px;
    cursor: pointer;
}

.scrolling-text {
    opacity: 0;
}

.change-header {
    color: var(--color);
    font-size: 30px;
    margin-bottom: 10px;
    transition: opacity 0.125s;
}
.change-details {
    color: var(--color);
    font-size: 20px;
    margin-bottom: 20px;
    text-wrap: wrap;
    transition: opacity 0.125s;
}
.details {
    padding: 0 30px;
    text-align: center;
}

.demo-image-border {
    border-radius: 15px;
    border: 2px solid #818181;
}
.demo-image {
    height: 70%;
}

.swipe-view {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-coordinate: 0 0;
    scroll-snap-type: x mandatory;
    flex: 1;
    display: flex;
    -webkit-overflow-scrolling: touch;
    height: 50vh;
    background-color: var(--background);
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    z-index: 1;

    section {
        width: 100vw;
        height: 100%;
        flex: 0 0 100vw;
        scroll-snap-align: start;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.swipe-view::-webkit-scrollbar {
    display: none;
}

.start-button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: auto;
    margin-right: auto;

    /* Styling */
    height: 50px;
    width: 250px;
    border-style: none;
    background-color: var(--blue);
    border-radius: 15px;

    cursor: pointer;
}

.welcome-page {
    display: flex;
    justify-content: center;
    align-items: center;
}

.grid-container {
    display: grid;
    grid-template-columns: auto auto;
}

.grid-item {
    padding: 30px;
    font-size: 15px;
    text-align: center;
    border-color: #141414;
}

.changetext {
    display: block;
    white-space: normal;
    color: var(--color);
}

.grid-image {
    width: 80px;
    filter: var(--change-svg-filter);
}
</style>
