<script setup lang="ts">
import { onMounted, onBeforeUpdate, onUpdated, ref, computed } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";
import type { SongReference } from "@/scripts/types";
import { refAutoReset } from "@vueuse/core";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

let num_of_songs = ref(0);
let book_name = ref("");
let primary_color = ref("#FFFFFF");
let secondary_color = ref("#000000");
let topical_index = ref<{ [topic: string]: SongReference[] }>({});
let rendered_topics = ref([]);
let active_topic = ref<string>("");
const songs_to_display = computed(() => {
  if (active_topic.value in topical_index.value) {
    return topical_index.value[active_topic.value];
  }
  return [];
});

function isSelected(_topic: string | number) {
    return false;
}

onBeforeUpdate(() => {
    rendered_topics.value = [];
})

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

onUpdated(async () => {
    let observer = new IntersectionObserver((entries, observer) => {
        for(var i = 0; i < rendered_topics.value.length; i++) {
            let entry = entries[i];
            if(entry == null)
                continue;
            if(entry.isIntersecting) {
                console.log(entry.target.childNodes[0].textContent);
                active_topic.value = entry.target.childNodes[0].textContent;
            }
        }
    }, {
        root: null,
        rootMargin: "0px",
        threshold: 0.8
    });
    for(var i = 0; i < rendered_topics.value.length; i++) {
        let element: Element = rendered_topics.value[i];
        observer.observe(element);
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
            <div v-for="(topic_songs, topic) in topical_index" :ref="el => {if(el) rendered_topics.push(el)}" :key="topic" class="topic" :style="{ background: primary_color }">
                <h3 class="topic-title">{{ topic }}</h3>
            </div>
        </div>
        <RouterLink
                v-for="song in songs_to_display"
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
.topic-title {
    color: white;
}
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
