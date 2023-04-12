<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData } from "@/scripts/book_import";
import type { RouterLink } from "vue-router";

const props = defineProps<{
    book: string;
}>();

let num_of_songs = ref(0);
let book_name = ref("");
let button_color = ref("#000000");

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    num_of_songs.value = BOOK_METADATA[props.book].numOfSongs;
    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="$router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
            <h1 id="bookName">
                {{ book_name }}
            </h1>
            <a id="topicalIndexButton">
                <img class="ionicon hidden" src="/assets/information-circle-outline.svg" />
            </a>
        </div>
    </div>

    <div class="songs" style="margin-top: 70px">
        <!-- Buttons will be added here -->
        <RouterLink
            v-for="song_num in num_of_songs"
            :key="song_num"
            :to="`/display/${$props.book}/${song_num}`"
            class="song-btn"
            :style="{ background: button_color }"
        >
            {{ song_num }}
        </RouterLink>
    </div>

    <nav class="nav">
        <a href="index.html" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/home.svg" />
            <span class="nav__text">Home</span>
        </a>
        <a href="search.html" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </a>
        <a href="bookmarks.html" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
            <span class="nav__text">Bookmarks</span>
        </a>
        <a href="settings.html" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </a>
    </nav>
</template>

<style>
@import "/css/selection.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
