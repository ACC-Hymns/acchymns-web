<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getAllSongMetaData, getAllBookMetaData } from "@/scripts/book_import";
import { computed, ref, onMounted } from "vue";
import { Capacitor } from "@capacitor/core";
import type { BookmarkedSong, SongReference, Song } from "@/scripts/types";
import { useLocalStorage } from "@vueuse/core";

let search_query = ref("");
let stripped_query = computed(() => {
    return search_query.value
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/s{2,}/g, " ")
        .toLowerCase();
});
let available_songs = ref<SongReference[]>([]);

let search_results = computed(() => {
    return available_songs.value
        .filter(s => {
            let stripped_number = s.number?.toLowerCase();
            return s.stripped_title?.includes(stripped_query.value) || stripped_number?.includes(stripped_query.value);
        })
        .sort((a, b) => a.title.localeCompare(b.title));
});

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const SONG_METADATA = await getAllSongMetaData();
    for (let bookmark of useLocalStorage<BookmarkedSong[]>("bookmarks", []).value) {
        let song: Song = SONG_METADATA[bookmark.book][bookmark.song];
        available_songs.value.push({
            title: song.title ?? "",
            stripped_title: (song?.title ?? "")
                .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
                .replace(/s{2,}/g, " ")
                .toLowerCase(),
            number: bookmark.song,
            book: BOOK_METADATA[bookmark.book],
        } as SongReference);
    }
});
</script>

<template>
    <h1 class="pagetitle">Bookmarks</h1>
    <div class="search-bar">
        <input v-model="search_query" placeholder="Search for a song title or number..." aria-label="Search through site content" />
        <button disabled>
            <svg viewBox="0 0 1024 1024">
                <path
                    class="path1"
                    d="M848.471 928l-263.059-263.059c-48.941 36.706-110.118 55.059-177.412 55.059-171.294 0-312-140.706-312-312s140.706-312 312-312c171.294 0 312 140.706 312 312 0 67.294-24.471 128.471-55.059 177.412l263.059 263.059-79.529 79.529zM189.623 408.078c0 121.364 97.091 218.455 218.455 218.455s218.455-97.091 218.455-218.455c0-121.364-103.159-218.455-218.455-218.455-121.364 0-218.455 97.091-218.455 218.455z"
                ></path>
            </svg>
        </button>
    </div>

    <h2>Bookmark Search Results</h2>
    <div class="songlist">
        <RouterLink
            v-for="song in search_results"
            :key="song.book.name.short + song.number"
            :to="`/display/${song.book.name.short}/${song.number}`"
            class="song"
            :style="`background: linear-gradient(135deg, ${song.book.primaryColor}, ${song.book.secondaryColor})`"
        >
            <div>
                <div class="song__title">{{ song.title }}</div>
                <div class="book__title">{{ song.book.name.medium }}</div>
            </div>
            <div class="booktext--right">
                <div class="song__number">#{{ song.number }}</div>
                <img
                    v-if="song.book.addOn && Capacitor.getPlatform() !== 'web'"
                    class="ionicon"
                    style="filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%)"
                    src="/assets/wifi.svg"
                />
            </div>
        </RouterLink>
    </div>

    <nav class="nav">
        <RouterLink to="/" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/home-outline.svg" />
            <span class="nav__text">Home</span>
        </RouterLink>
        <RouterLink to="/search" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </RouterLink>
        <RouterLink to="/bookmarks" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/bookmark.svg" />
            <span class="nav__text">Bookmarks</span>
        </RouterLink>
        <RouterLink to="/settings" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style>
@import "/css/search.css";
@import "/css/song.css";
</style>
