<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";
import type { SongReference } from "@/scripts/types";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

let num_of_songs = ref(0);
let book_name = ref("");
let primary_color = ref("#000000");
let secondary_color = ref("#000000");
let topical_index = ref<{ [topic: string]: SongReference[] }>({});

function isSelected(_topic: string | number) {
    return false;
}

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const BOOK_SONG_METADATA = await getSongMetaData(props.book);
    num_of_songs.value = BOOK_METADATA[props.book].numOfSongs;
    book_name.value = BOOK_METADATA[props.book].name.medium;
    primary_color.value = BOOK_METADATA[props.book].primaryColor;
    secondary_color.value = BOOK_METADATA[props.book].secondaryColor;
    const raw_index = (await getBookIndex(BOOK_METADATA[props.book].name.short)) ?? {};
    for (let [topic_name, numbers] of Object.entries(raw_index)) {
        topical_index.value[topic_name] = [];
        for (let song_number of numbers) {
            topical_index.value[topic_name].push({
                number: song_number,
                title: BOOK_SONG_METADATA[song_number].title,
                notes: BOOK_SONG_METADATA[song_number].notes,
                book: BOOK_METADATA[props.book],
            });
        }
        topical_index.value[topic_name].sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    }
});
</script>

<template>
    <div id="menu" class="menu">
        <div class="title">
            <img @click="router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
            <h1>{{ book_name }} Topical Index</h1>

            <!-- Empty element cause CSS too hard -->
            <a></a>
        </div>
    </div>

    <div style="margin-top: 70px">
        <!-- Each Topical Section -->
        <div class="topic-list">
            <div v-for="(topic_songs, topic) in topical_index" :key="topic" class="topic" :style="{ background: isSelected(topic) ? primary_color : secondary_color }">
                {{ topic }}
            </div>
            <!-- <RouterLink
                v-for="song in topic_songs"
                :key="song.title + song.number"
                :to="`/display/${song.book.name.short}/${song.number}`"
                class="song"
                :style="`background: linear-gradient(135deg, ${song.book.primaryColor}, ${song.book.secondaryColor})`"
            >
                <div>
                    <div class="song__title">{{ song.title }}</div>
                </div>
                <div class="booktext--right">
                    <div class="song__number">#{{ song.number }}</div>
                </div>
            </RouterLink> -->
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

<style>
@import "@/assets/css/song.css";
</style>

<style scoped>
.topic-list {
    scroll-snap-type: x mandatory;
    overflow-x: scroll;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    /* padding: 5px 20px 20px 20px; */
    scrollbar-width: none;
    width: 100%;
}
/* .topic-list::-webkit-scrollbar {
    display: none;
} */

/**
 * Fix overflow scroll ignoring margin/padding.
 * @see https://chenhuijing.com/blog/flexbox-and-padding/
 * @see https://itnext.io/horizontal-overflow-with-flexbox-css-64f530495303
 */
.topic-list::before,
.topic-list::after {
    content: "";
    display: inline-block;
    flex: 0 0 auto;
    width: 300px;
    margin-left: -1px;
}

/*.topic-list:first-child {
    margin-left: 100px;
}
.topic-list:last-child {
    margin-right: 100px;
} */

.topic {
    height: 80px;
    /* width: 300px; */
    min-width: 300px;
    /* flex: 1 0 100%; */
    scroll-snap-stop: always;
    scroll-snap-align: center;

    /* padding: 10px; */
    text-align: center;
    color: white;
    border-radius: 15px;
    margin-right: 15px;

    display: flex;
    flex-flow: column;
    justify-content: center;
}
</style>
