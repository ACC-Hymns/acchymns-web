<script setup lang="ts">
import { onMounted, onUpdated, ref, computed } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";
import type { Song } from "@/scripts/types";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

let num_of_songs = ref(0);
let book_ref = ref("");
let primary_color = ref("#FFFFFF");
let secondary_color = ref("#000000");
let topical_index = ref<{ [topic: string]: Song[] }>({});
let rendered_topics = ref<Element[]>([]);
let active_topic = ref<string>("");
const songs_to_display = computed(() => {
    if (active_topic.value in topical_index.value) {
        return topical_index.value[active_topic.value];
    }
    return [];
});

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const BOOK_SONG_METADATA = await getSongMetaData(props.book);
    num_of_songs.value = BOOK_METADATA[props.book].numOfSongs;
    book_ref.value = BOOK_METADATA[props.book].name.short;
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
            });
        }
        topical_index.value[topic_name].sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    }
});

onUpdated(async () => {
    let observer = new IntersectionObserver(
        (entries, _observer) => {
            for (const entry of entries) {
                // console.log(entries.map(entry => entry.isIntersecting))
                if (entry.isIntersecting) {
                    console.log(entry.target.childNodes[1].textContent);
                    active_topic.value = entry.target.childNodes[1].textContent as string;
                }
            }
        },
        {
            root: null,
            rootMargin: "0px",
            threshold: 0.8,
        }
    );
    for (const element of rendered_topics.value) {
        observer.observe(element);
    }
});
</script>

<template>
    <div id="menu" class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>Topical Index</h1>
            </div>
            <div class="title--right">
                <!-- Empty element cause CSS too hard -->
                <a></a>
            </div>
        </div>
    </div>

    <div style="margin-top: 70px">
        <!-- Each Topical Section -->
        <div class="topic-list">
            <div v-for="(_topic_songs, topic) in topical_index" ref="rendered_topics" :key="topic" class="topic" :style="{ background: primary_color }">
                <img class="ionicon topic-arrow" src="/assets/chevron-back-outline.svg" /><h3 class="topic-title">{{ topic }}</h3><img class="ionicon topic-arrow" src="/assets/chevron-forward-outline.svg" />
            </div>
        </div>
        <RouterLink
            v-for="song in songs_to_display"
            :key="song.title + song.number"
            :to="`/display/${book_ref}/${song.number}`"
            class="song"
            :style="`background: linear-gradient(135deg, ${primary_color}, ${secondary_color})`"
        >
            <div>
                <div class="song__title">{{ song.title }}</div>
            </div>
            <div class="booktext--right">
                <div class="song__number">#{{ song.number }}</div>
            </div>
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

/* Hide scrollbar for Chrome, Safari and Opera */
.topic-list::-webkit-scrollbar {
    display: none;
}

.topic-list {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.topic {
    height: 80px;
    /* width: 300px; */
    min-width: calc(100vw - 30px);
    /* flex: 1 0 100%; */
    scroll-snap-stop: always;
    scroll-snap-align: center;

    /* padding: 10px; */
    text-align: center;
    color: white;
    border-radius: 15px;
    margin: 5px 15px;
    display: flex;
    justify-content:space-between;
}

.topic-arrow {
    filter: invert(100%);
    display:inline-block;
    top: calc(50% - 50px/2);
    position: relative;
    height: 50px;
    padding: 0px 10px;
}

.topic-title {
    color: white;
    display:inline-block;
    top: calc(50% - 50px/2);
    position: relative;
    height: 50px;
    line-height: 50px;
    margin-top: 0px;
    margin-bottom: 0px;
}

</style>
