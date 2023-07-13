<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";
import type { Song } from "@/scripts/types";
import { useSessionStorage } from "@vueuse/core";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

const show_list = ref(true);
const error_active = ref(false);
const scroll_topic_list = ref<Element | null>(null);

let book_ref = ref("");
let primary_color = ref("#FFFFFF");
let secondary_color = ref("#000000");
let topical_index = ref<{ [topic: string]: Song[] }>({});
let active_topic = ref<string>("");

let BOOK_SONG_METADATA: any = null;
let BOOK_METADATA: any = null;
const songs_to_display = computed(() => {
    if (isAlphabetical.value) {
        return alphabeticalSongs.value;
    } else {
        if (active_topic.value in topical_index.value) {
            return topical_index.value[active_topic.value];
        }
    }
    return [];
});

onMounted(async () => {
    BOOK_METADATA = await getAllBookMetaData();
    BOOK_SONG_METADATA = await getSongMetaData(props.book);
    book_ref.value = BOOK_METADATA[props.book].name.short;
    primary_color.value = BOOK_METADATA[props.book].primaryColor;
    secondary_color.value = BOOK_METADATA[props.book].secondaryColor;
    const raw_index = await getBookIndex(BOOK_METADATA[props.book].name.short);
    if (raw_index == null || BOOK_SONG_METADATA == null) {
        error_active.value = true;
        return;
    }
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
    for (const song_number of Object.keys(BOOK_SONG_METADATA)) {
        let song: Song = BOOK_SONG_METADATA[song_number];
        alphabeticalSongs.value.push({
            title: song?.title ?? "",
            number: song_number,
            notes: song?.notes,
            first_line: song?.first_line,
        });
    }
    alphabeticalSongs.value.sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));

    title.value = "Topical Index";
    icon.value = "../assets/text.svg";
});

function hideList(topic: string) {
    if (show_list.value) {
        show_list.value = false;
        active_topic.value = topic;
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, 10);
    } else {
        showList();
    }
}

function showList() {
    show_list.value = true;
    active_topic.value = "";
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, 10);
}

function goBack() {
    if (show_list.value) {
        router.back();
    } else {
        showList();
    }
}

let isAlphabetical = useSessionStorage<boolean>("isAlphabetical", false);
const alphabeticalSongs = ref<Song[]>([]);
let title = ref("Topical Index");
let icon = ref("../assets/text.svg");
function toggleAlphabetical() {
    isAlphabetical.value = !isAlphabetical.value;
    if (isAlphabetical.value) {
        title.value = "Alphabetical Index";
        icon.value = "../assets/list-bulleted.svg";
    } else {
        title.value = "Topical Index";
        icon.value = "../assets/text.svg";
    }
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, 10);
}
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="goBack()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">{{ title }}</h1>
            <img @click="toggleAlphabetical()" class="ionicon title--right" :src="icon" />
        </div>
    </div>

    <div v-if="error_active" class="fallback-container">
        <img class="wifi-fallback" src="/assets/wifi_off.svg" />
    </div>
    <div v-else class="main-content">
        <!-- Each Topical Section -->
        <div v-if="!isAlphabetical">
            <div ref="scroll_topic_list">
                <div :key="active_topic" v-if="!show_list" class="topic" :style="{ background: primary_color }" @click="showList">
                    <h3 class="topic-title">{{ active_topic }}</h3>
                </div>
            </div>
            <RouterLink
                v-show="!show_list"
                v-for="song in songs_to_display"
                :key="song.title + song.number"
                :to="`/display/${book_ref}/${song.number}`"
                class="song topic-song"
                :style="`background: linear-gradient(135deg, ${primary_color}, ${secondary_color})`"
            >
                <div>
                    <div class="song__title">{{ song.title }}</div>
                </div>
                <div class="booktext--right">
                    <div class="song__number">#{{ song.number }}</div>
                </div>
            </RouterLink>
            <div class="topic-list">
                <template v-for="(_topic_songs, topic) in topical_index" :key="topic">
                    <div v-if="show_list" class="topic expanded-topic" :style="{ background: primary_color }" @click="hideList(topic as string)">
                        <h3 class="topic-title">{{ topic }}</h3>
                    </div>
                </template>
            </div>
        </div>
        <div v-else>
            <RouterLink
                v-for="song in songs_to_display"
                :key="song.title + song.number"
                :to="`/display/${book_ref}/${song.number}`"
                class="song topic-song"
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
    padding-bottom: calc(env(safe-area-inset-bottom) + 70px);
}

.topic-song {
    margin-top: 10px;
}

.topic {
    height: 80px;
    min-width: calc(100vw - 30px);

    text-align: center;
    color: white;
    border-radius: 15px;
    margin: 0px 15px;
}

.expanded-topic {
    margin: 0px 15px 10px 15px !important;
}

.topic-arrow {
    filter: invert(100%);
    display: inline-block;
    top: calc(50% - 50px / 2);
    position: relative;
    height: 50px;
    padding: 0px 10px;
}

.topic-title {
    color: white;
    display: inline-block;
    top: calc(50% - 50px / 2);
    position: relative;
    height: 50px;
    line-height: 50px;
    margin-top: 0px;
    margin-bottom: 0px;
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
