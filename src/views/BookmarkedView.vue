<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getAllSongMetaData, getAllBookMetaData } from "@/scripts/book_import";
import { computed, ref, onMounted } from "vue";
import type { SongReference, SongSearchInfo, Song } from "@/scripts/types";
import { stripSearchText } from "@/scripts/search";
import { useCapacitorPreferences } from "@/composables/preferences";
import NavigationBar from "@/components/NavigationBar.vue";

let search_query = ref("");
let stripped_query = computed(() => {
    return stripSearchText(search_query.value);
});
let available_songs = ref<SongSearchInfo[]>([]);

let search_results = computed(() => {
    return available_songs.value
        .filter(s => {
            return s.stripped_title?.includes(stripped_query.value) || s?.stripped_first_line?.includes(stripped_query.value) || s?.number?.includes(stripped_query.value);
        })
        .sort((a, b) => a.title.localeCompare(b.title));
});

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const SONG_METADATA = await getAllSongMetaData();

    for (const bookmark of bookmarks.value) {
        if (SONG_METADATA[bookmark.book] == undefined) {
            continue;
        }
        const song: Song = SONG_METADATA[bookmark.book][bookmark.number];
        available_songs.value.push({
            title: song.title ?? "",
            number: bookmark.number,
            book: BOOK_METADATA[bookmark.book],
            stripped_title: stripSearchText(song.title ?? ""),
            stripped_first_line: stripSearchText(song.first_line ?? ""),
        } as SongSearchInfo);
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

    <h2>Bookmarked Songs</h2>
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
            </div>
        </RouterLink>
    </div>

    <NavigationBar current_page="bookmarks" />
</template>

<style>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";
</style>
