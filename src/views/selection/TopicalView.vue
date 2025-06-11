<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, onBeforeRouteLeave, useRoute } from "vue-router";
import type { Song } from "@/scripts/types";
import { saveScrollPosition, restoreScrollPosition, saveGroupOpened, getGroupOpened, removeGroupOpened, removeScrollPosition } from "@/router/scroll";

const route = useRoute();
const props = { book: route.params.book as string };

const error_active = ref(false);

let book_ref = ref("");
let primary_color = ref("#FFFFFF");
let secondary_color = ref("#000000");
let topical_index = ref<{ [topic: string]: Song[] }>({});

let BOOK_SONG_METADATA: any = null;
let BOOK_METADATA: any = null;

onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
    if (!_.fullPath.includes("/display")) {
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
        topical_index.value[topic_name].sort((a, b) =>
            a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")),
        );
    }
    song_number_groups.value = Object.keys(topical_index.value);
    let group_ids = getGroupOpened(route.fullPath);
    if (group_ids != undefined) {
        group_ids.forEach(id => {
            song_number_groups_active.value.push(song_number_groups.value[id]);
        });
    }

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
});

let song_number_groups = ref<string[]>([]);
let song_number_groups_active = ref<string[]>([]);
function toggleDropdown(topic: string) {
    if (song_number_groups_active.value.includes(topic)) {
        song_number_groups_active.value.splice(song_number_groups_active.value.indexOf(topic), 1);
    } else {
        song_number_groups_active.value.push(topic);
    }

    let ids: number[] = [];
    song_number_groups_active.value.forEach(group_id => {
        var index = song_number_groups.value.indexOf(group_id);
        ids.push(index);
    });
    saveGroupOpened(route.fullPath, ids);
}
</script>

<template>
    <div>
        <!-- Each Topical Section -->
        <div v-for="(_topic_songs, topic) in topical_index" :key="topic" class="song-group-container" ref="song_group_elements">
            <div class="song-group-title-container" @click="toggleDropdown(topic.toString())">
                <div class="song-title">{{ topic }}</div>
                <img
                    class="ionicon nav__icon dropdown-icon"
                    src="/assets/chevron-back-outline.svg"
                    :class="{ 'dropdown-icon-active': song_number_groups_active.includes(topic.toString()) }"
                />
            </div>
            <div class="wrapper" :class="{ 'wrapper-active': song_number_groups_active.includes(topic.toString()) }">
                <div class="song-button-container" :class="{ 'song-button-container-active': song_number_groups_active.includes(topic.toString()) }">
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
