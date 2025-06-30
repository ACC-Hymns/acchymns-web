<script setup lang="ts">
import { RouterLink, onBeforeRouteLeave, useRoute } from "vue-router";
import { getAllSongMetaData, getAllBookMetaData, getBookDataSummaryFromName } from "@/scripts/book_import";
import { computed, ref, onMounted, watch, nextTick } from "vue";
import { useSessionStorage } from "@vueuse/core";
import { type BookSummary, type Song, type SongSearchInfo, type SearchParams, type BookDataSummary } from "@/scripts/types";
import { hexToRgb, Color, Solver } from "@/scripts/color";
import { known_references, prepackaged_books } from "@/scripts/constants";
import { saveScrollPosition, restoreScrollPosition } from "@/router/scroll";
import { stripSearchText } from "@/scripts/search";
import NavigationBar from "@/components/NavigationBar.vue";
import { vOnClickOutside } from "@vueuse/components";
import BookFilter from "@/components/BookFilter.vue";

// Saving position in book
onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
});

const route = useRoute();
const search_params = useSessionStorage<SearchParams>("searchParams", { search: "", bookFilters: [] });

const search_query = ref(search_params.value.search);
const stripped_query = computed(() => {
    return stripSearchText(search_query.value);
});

watch(search_query, new_query => {
    search_params.value.search = new_query;
});

const available_songs = ref<SongSearchInfo[]>([]);
const available_books = ref<BookSummary[]>([]);
const book_data_summaries = ref<Map<string, BookDataSummary>>(new Map<string, BookDataSummary>());

const search_results = computed(() => {
    if (search_params.value.bookFilters.length > 0) {
        return available_songs.value
            .filter(s => {
                return (
                    (s.stripped_title?.includes(stripped_query.value) ||
                        s?.stripped_first_line?.includes(stripped_query.value) ||
                        s?.number == stripped_query.value) &&
                    search_params.value.bookFilters.find(b => b == s.book.name.short)
                );
            })
            .sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    } else {
        if (search_query.value === "") return [];
        return available_songs.value
            .filter(s => {
                return (
                    s.stripped_title?.includes(stripped_query.value) ||
                    s?.stripped_first_line?.includes(stripped_query.value) ||
                    s?.number == stripped_query.value
                );
            })
            .sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    }
});

const increment = 50;
const display_limit = ref(increment);

const limited_search_results = computed(() => {
    // Fuzzy limiting of search results, I.E. if the limit is 50, but there are 90 songs, just show the 90 songs
    if (search_results.value.length - display_limit.value < increment) {
        return search_results.value;
    }
    return search_results.value.slice(0, display_limit.value);
});

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const SONG_METADATA = await getAllSongMetaData();
    available_books.value.push(...Object.values(BOOK_METADATA));
    for (const book of Object.keys(SONG_METADATA)) {
        for (const song_number of Object.keys(SONG_METADATA[book])) {
            let song: Song = SONG_METADATA[book][song_number];

            if (song.title == undefined) song.title = "";

            available_songs.value.push({
                title: song?.title ?? "",
                number: song_number,
                book: BOOK_METADATA[book],
                stripped_title: stripSearchText(song?.title ?? ""),
                stripped_first_line: stripSearchText(song?.first_line ?? ""),
            } as SongSearchInfo);
        }
    }

    prepackaged_books.concat(Object.keys(known_references)).forEach(async book => {
        let book_data: BookDataSummary | undefined = await getBookDataSummaryFromName(book);
        if (book_data == undefined) return;
        book_data_summaries.value.set(book, book_data);
    });

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
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
    <BookFilter
        class="book-filter"
        :books="available_books"
        :selected-books="search_params.bookFilters"
        @update:selectedBooks="search_params.bookFilters = $event"
    />

    <h2 v-if="search_results.length > 0" style="margin-top: 10px; margin-bottom: 10px">Search Results ({{ search_results.length }})</h2>
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
            </div>
        </RouterLink>
        <div
            v-if="limited_search_results.length < search_results.length"
            @click="display_limit += increment"
            class="song"
            style="background: var(--blue); justify-content: center; cursor: pointer"
        >
            <div class="song__title">Show more</div>
        </div>
    </div>

    <NavigationBar current_page="search" />
</template>

<style scoped>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";

.book-filter {
    padding: 0px 20px 20px 20px;
}
</style>
