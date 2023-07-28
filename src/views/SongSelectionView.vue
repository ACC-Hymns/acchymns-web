<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";
import { useLocalStorage, useSessionStorage } from "@vueuse/core";
import { useHead } from "@unhead/vue";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

let topical_index_tooltip_status = useLocalStorage<boolean>("topical_index_tooltip_complete", false);

const error_active = ref(false);

const song_numbers = ref<string[]>([]);
let book_name = ref("");
let index_available = ref(false);
let button_color = ref("#000000");
let tooltip = ref<Element>();

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songs = await getSongMetaData(props.book);

    if (songs == null) {
        error_active.value = true;
        return;
    }
    song_numbers.value = Object.keys(songs).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
    index_available.value = BOOK_METADATA[props.book].indexAvailable;

    useSessionStorage<boolean>("isAlphabetical", false).value = false;
});

function hideTooltip() {
    tooltip.value?.classList.add("tooltiphidden");
    tooltip.value?.classList.add("tooltip");
    setTimeout(() => {
        topical_index_tooltip_status.value = true;
    }, 1000);
}

useHead({
    meta: [
        {
            property: "og:title",
            content: book_name,
        },
        {
            property: "og:type",
            content: "music.album",
        },
        {
            property: "og:site_name",
            content: "ACC Hymns",
        },
    ],
});
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
        <!-- Buttons will be added here -->
        <RouterLink v-for="song_num in song_numbers" :key="song_num" :to="`/display/${props.book}/${song_num}`" class="song-btn" :style="{ background: button_color }">
            {{ song_num }}
        </RouterLink>
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
    justify-content: center;
    flex-wrap: wrap;
    padding: 0px 10px 110px 10px;
    margin-top: 80px;
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
