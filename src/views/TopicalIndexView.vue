<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import type { Song } from "@/scripts/types";
import { useSessionStorage } from "@vueuse/core";
import { saveScrollPosition, restoreScrollPosition, saveGroupOpened, getGroupOpened, removeGroupOpened, removeScrollPosition } from "@/router/scroll";
import NavigationBar from "@/components/NavigationBar.vue";

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

onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
    if(!_.fullPath.includes("/display")) {
        removeGroupOpened(from.fullPath);
        removeScrollPosition(from.fullPath);
    }
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
    song_number_groups.value = Object.keys(topical_index.value);
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

    if (isAlphabetical.value) {
        title.value = "Alphabetical Index";
        icon.value = import.meta.env.BASE_URL + "assets/list-bulleted.svg";
    } else {
        title.value = "Topical Index";
        icon.value = import.meta.env.BASE_URL + "assets/text.svg";
    }

    let group_ids = getGroupOpened(route.fullPath);
    if(group_ids != undefined) {
        group_ids.forEach((id) => {
            song_number_groups_active.value.push(song_number_groups.value[id]);
        })
    }

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
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
let icon = ref(import.meta.env.BASE_URL + "assets/text.svg");
function toggleAlphabetical() {
    isAlphabetical.value = !isAlphabetical.value;
    if (isAlphabetical.value) {
        title.value = "Alphabetical Index";
        icon.value = import.meta.env.BASE_URL + "assets/list-bulleted.svg";
    } else {
        title.value = "Topical Index";
        icon.value = import.meta.env.BASE_URL + "assets/text.svg";
    }
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, 10);
}

let song_number_groups = ref<string[]>([]);
let song_number_groups_active = ref<string[]>([]);
const route = useRoute();
function toggleDropdown(topic: string) {
    if (song_number_groups_active.value.includes(topic)) {
        song_number_groups_active.value.splice(song_number_groups_active.value.indexOf(topic), 1);
    } else {
        song_number_groups_active.value.push(topic);
    }

    let ids: number[] = [];
    song_number_groups_active.value.forEach((group_id) => {
        var index = song_number_groups.value.indexOf(group_id);
        ids.push(index);
    })
    saveGroupOpened(route.fullPath, ids);
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
            <div v-for="(_topic_songs, topic) in topical_index" :key="topic" class="song-group-container" ref="song_group_elements">
                <div class="song-group-title-container" @click="toggleDropdown(topic.toString())">
                    <div class="song-title">{{topic}}</div>
                    <img class="ionicon nav__icon dropdown-icon" src="/assets/chevron-back-outline.svg" :class="{'dropdown-icon-active': song_number_groups_active.includes(topic.toString())}"/>
                </div>
                <div class="wrapper" :class="{'wrapper-active': song_number_groups_active.includes(topic.toString())}">
                    <div class="song-button-container" :class="{'song-button-container-active': song_number_groups_active.includes(topic.toString())}">
                        <RouterLink
                            v-for="song in topical_index[topic]"
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
            </div>
        </div>
        <div class="song-list" v-else>
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
    </div>

    <NavigationBar current_page="home" />
</template>

<style>
@import "@/assets/css/song.css";
</style>

<style scoped>
.song-group-container {
    /*border: 1px solid #bebebe;*/
    box-shadow: var(--thin-shadow);
    background-color: var(--button-color);
    border-radius: 15px;
    margin: 10px;
    padding: 15px;
}

.song-group-title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.song-title {
    text-decoration: none;
    color: var(--color);
    font-weight: 400;
}

.dropdown-icon {
    transition: rotate ease-out 0.4s;
    transform: translateX(-3px);
    rotate: calc(-90deg);
}

.dropdown-icon-active {
    transition: rotate ease-out 0.4s;
    transform: translateX(3px);
    rotate: calc(90deg);
}

.wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s;
}

.wrapper-active {
    grid-template-rows: 1fr;
}

.song-button-container {
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.song-button-container-active {
    padding-bottom: 20px;
    margin-top: 15px;
}

.song-list {
    padding-bottom: calc(env(safe-area-inset-bottom) + 70px);
}

.topic-song {
    width: 100%;
    margin: 2px 0;
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
