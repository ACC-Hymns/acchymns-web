<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getAllSongMetaData, getAllBookMetaData } from "@/scripts/book_import";
import { computed, ref, onMounted, watch } from "vue";
import { useSessionStorage } from "@vueuse/core";
import { Capacitor } from "@capacitor/core";
import type { BookSummary, Song, SongReference, SearchParams } from "@/scripts/types";

let search_params = useSessionStorage<SearchParams>("searchParams", { search: "", bookFilters: [] });

let search_query = ref(search_params.value.search);
let stripped_query = computed(() => {
    return search_query.value
        .replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")
        .replace(/s{2,}/g, " ")
        .toLowerCase();
});

watch(stripped_query, (new_query) => {
    search_params.value.search = new_query;
});

let available_songs = ref<SongReference[]>([]);
let available_books = ref<BookSummary[]>([]);

let display_limit = ref(50);
let search_results = computed(() => {
    if (search_params.value.bookFilters.length > 0) {
        return available_songs.value
            .filter((s) => {
                let stripped_number = s.number?.toLowerCase() ?? "";
                return (
                    (s.stripped_title?.includes(stripped_query.value) || stripped_number.includes(stripped_query.value)) &&
                    search_params.value.bookFilters.find((b) => b.name.short == s.book.name.short)
                );
            })
            .sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    } else {
        if (search_query.value === "") return [];
        return available_songs.value
            .filter((s) => {
                let stripped_number = s.number?.toLowerCase() ?? "";
                return s.stripped_title?.includes(stripped_query.value) || stripped_number.includes(stripped_query.value);
            })
            .sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    }
});

let limited_search_results = computed(() => {
    return search_results.value.slice(0, display_limit.value);
});

function filterBook(book: BookSummary) {
    if (search_params.value.bookFilters.find((b) => b.name.short == book.name.short)) {
        let foundBook = search_params.value.bookFilters.find((b) => b.name.short == book.name.short);
        if (foundBook) search_params.value.bookFilters.splice(search_params.value.bookFilters.indexOf(foundBook), 1);
    } else search_params.value.bookFilters.push(book);
}

function check_selected(book: BookSummary) {
    if (search_params.value.bookFilters.length == 0) return false;
    return search_params.value.bookFilters.find((b) => b.name.short == book.name.short);
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}
function componentToHex(c: any) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r: any, g: any, b: any) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function darken(input: string) {
    let baseColor = hexToRgb(input);
    if (!baseColor) return input;
    baseColor.r *= 0.5;
    baseColor.g *= 0.5;
    baseColor.b *= 0.5;
    console.log(rgbToHex(Math.round(baseColor.r), Math.round(baseColor.g), Math.round(baseColor.b)));
    return rgbToHex(Math.round(baseColor.r), Math.round(baseColor.g), Math.round(baseColor.b));
}

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const SONG_METADATA = await getAllSongMetaData();
    for (const book2 of Object.keys(SONG_METADATA)) {
        available_books.value.push(BOOK_METADATA[book2]);
        for (const song_number of Object.keys(SONG_METADATA[book2])) {
            let song: Song = SONG_METADATA[book2][song_number];
            available_songs.value.push({
                title: song?.title ?? "",
                number: song_number,
                book: BOOK_METADATA[book2],
                stripped_title: song?.title
                    .replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")
                    .replace(/s{2,}/g, " ")
                    .toLowerCase(),
            } as SongReference);
        }
    }
});
</script>

<template>
    <h1 class="pagetitle">Search</h1>
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

    <h2>Filter by Hymnal</h2>
    <div class="hymnalfilters">
        <a
            v-for="book in available_books"
            :key="book.name.medium"
            class="hymnalfilterbutton"
            :style="`background-color: ${check_selected(book) ? darken(book.primaryColor) : book.primaryColor}`"
            @click="filterBook(book)"
        >
            <div>{{ book.name.medium }}</div>
        </a>
    </div>

    <h2 v-if="search_results.length > 0">Search Results ({{ search_results.length }})</h2>
    <div class="songlist">
        <RouterLink
            v-for="song in limited_search_results"
            :key="song.title + song.number + song.book.name.short"
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
        <div v-if="display_limit < search_results.length" @click="display_limit += 50" class="song" style="background: #2196f3; justify-content: center">
            <div class="song__title">Click for more results...</div>
        </div>
    </div>

    <nav class="nav">
        <RouterLink to="/" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/home-outline.svg" />
            <span class="nav__text">Home</span>
        </RouterLink>
        <RouterLink to="/search" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/search.svg" />
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

<style>
@import "/css/search.css";
@import "/css/song.css";
</style>
