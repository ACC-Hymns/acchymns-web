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

const is_open = ref<boolean>(false);
const dropdown_animation = ref<boolean>(false);

function resetDropdown() {
    dropdown_animation.value = false;
    setTimeout(() => {
        is_open.value = false;
    }, 200);
}
function toggleDropdown() {
    if (is_open.value) {
        resetDropdown();
    } else {
        is_open.value = true;
        dropdown_animation.value = true;
    }
}

let book_filters = ref<Element[]>([]);

function filterBook(short_book_name: string) {
    is_open.value = true;
    if (search_params.value.bookFilters.includes(short_book_name)) {
        let index = search_params.value.bookFilters.findIndex(b => b == short_book_name);
        search_params.value.bookFilters.splice(index, 1);
    } else {
        search_params.value.bookFilters.push(short_book_name);
    }
}

function clearFilters() {
    search_params.value.bookFilters = [];
}

function checkmarked(selected: boolean) {
    if (selected) {
        return "./assets/checkmark-circle.svg";
    } else {
        return "./assets/ellipse-outline.svg";
    }
}

function calculateIconFilter(color: string) {
    const rgb = hexToRgb(color ?? "#000000");
    if (rgb?.length !== 3) {
        return "";
    }
    const solver = new Solver(new Color(rgb[0], rgb[1], rgb[2]));
    const result = solver.solve();
    return result.filter;
}
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
    <div class="filters" v-on-click-outside="resetDropdown">
        <a @click="toggleDropdown()" class="dropdown">
            <p class="dropdown-text">Filters</p>
            <img class="ionicon filter-icon" src="/assets/filter-outline.svg" />
        </a>
        <div class="dropdown-content-wrapper" v-show="is_open">
            <div class="dropdown-content" :class="{ 'dropdown-content-active': dropdown_animation }">
                <a>
                    <div class="dropdown-content-top-item" @click="clearFilters">
                        <img class="ionicon checkmark-icon" :src="checkmarked(search_params.bookFilters.length == 0)" />
                        <div class="dropdown-content-text">All Hymnals</div>
                    </div>
                </a>
                <div :class="{ 'dropdown-content-organizer': available_books.length > 6 }">
                    <a v-for="book in available_books" :key="book.name.medium" @click="filterBook(book.name.short)" ref="book_filters">
                        <div class="dropdown-content-item">
                            <img
                                class="ionicon"
                                :src="checkmarked(search_params.bookFilters.includes(book.name.short))"
                                :style="calculateIconFilter(book.primaryColor)"
                            />
                            <div class="dropdown-content-text">{{ book.name.medium }}</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>

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

<style>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";

@keyframes fadeIn {
    from {
        visibility: visible;
        opacity: 0;
        transform: translateY(-15px);
    }
    to {
        opacity: 1;
        transform: translateY(0px);
        visibility: visible;
    }
}

@keyframes fadeOut {
    from {
        visibility: visible;
        opacity: 1;
        transform: translateY(0px);
    }
    to {
        opacity: 0;
        transform: translateY(-15px);
        visibility: hidden;
    }
}

.dropdown-content-wrapper {
    z-index: 1;
    position: absolute;
    transition: all 0.2s ease;
}

.dropdown-content {
    position: relative;
    background-color: var(--button-color);
    color: var(--color);
    border-radius: 15px;
    min-width: 160px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    z-index: 1;
    margin-top: 10px;
    padding-bottom: 5px;
    animation-name: fadeOut;
    animation-duration: 0.2s;
    animation-fill-mode: both;
}

.dropdown-content-organizer {
    display: grid;
    grid-template-columns: 45vw 45vw;
    height: 300px;
    overflow-y: auto;

    @media (min-width: 641px) {
        grid-template-columns: 1fr 1fr;
    }
}

.dropdown-content-top-item {
    cursor: pointer;
    border-bottom: var(--border-color);
    padding: 0px 15px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.dropdown-content-active {
    visibility: visible;
    animation-name: fadeIn;
    animation-duration: 0.2s;
}

.dropdown-content-item {
    cursor: pointer;
    padding: 0px 15px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.dropdown-content-text {
    padding: 15px 0px 15px 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dropdown {
    cursor: pointer;
    background-color: var(--button-color);
    color: var(--color);
    padding: 10px 15px;
    border-radius: 30px;
    border-width: 2px;
    box-shadow: var(--thin-shadow);
    display: flex;
    justify-content: center;
    margin-top: 5px;
    margin-right: 10px;
    z-index: 1;
}

.dropdown-text {
    margin: 0;
    height: 25px;
    line-height: 25px;
}

.filter-icon {
    filter: var(--change-svg-filter);
    display: inline-block;
    position: relative;
    margin: auto auto;
    padding-left: 15px;
}

.checkmark-icon {
    filter: var(--svg-color);
}
</style>
