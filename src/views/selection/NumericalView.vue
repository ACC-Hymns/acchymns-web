<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData, handle_missing_book } from "@/scripts/book_import";
import { RouterLink, useRoute, onBeforeRouteLeave } from "vue-router";
import { useLocalStorage, useSessionStorage } from "@vueuse/core";
import { saveScrollPosition, restoreScrollPosition, saveGroupOpened, getGroupOpened, removeGroupOpened, removeScrollPosition } from "@/router/scroll";

const route = useRoute();
const props = { book: route.params.book as string };

// Saving position in book
onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
    if (!_.fullPath.includes("/display")) {
        removeGroupOpened(from.fullPath);
        removeScrollPosition(from.fullPath);
    }
});

const error_active = ref(false);

const song_numbers = ref<string[]>([]);
let book_name = ref("");
let index_available = ref(false);
let button_color = ref("#000000");
let song_number_groups = ref<string[][]>([]);
let song_number_groups_active = ref<string[][]>([]);
let song_group_elements = ref<any[]>();
let song_group_enabled = useLocalStorage<boolean>("ACCOptions.songGroupEnabled", true);

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songs = await getSongMetaData(props.book);

    if (songs == null) {
        await handle_missing_book(props.book);

        error_active.value = true;
        return;
    }
    song_numbers.value = Object.keys(songs).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

    // 400 songs? 5 groups
    // 1-99, 100-199, 200-299, 300-399, 400
    let song_count = song_numbers.value.length;
    let num_groups = Math.ceil(song_count / 100);

    // Dividing songs into groups of 100
    for (let i = 0; i < num_groups; i++) {
        const re = new RegExp(/[a-z]/, "i");
        song_number_groups.value?.push(
            song_numbers.value.filter(song => {
                let song_num = song.replace(re, "");
                let start = i * 100;
                let end = (i + 1) * 100 - 1;
                if (i === num_groups - 1 && song_count === end + 1) {
                    return start <= Number(song_num);
                }
                return start <= Number(song_num) && Number(song_num) <= end;
            }),
        );
    }

    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
    index_available.value = BOOK_METADATA[props.book].indexAvailable;

    useSessionStorage<boolean>("isAlphabetical", false).value = false;

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

function toggleDropdown(group: string[]) {
    if (song_number_groups_active.value.includes(group)) {
        song_number_groups_active.value.splice(song_number_groups_active.value.indexOf(group), 1);
    } else {
        song_number_groups_active.value.push(group);
    }
    let ids: number[] = [];
    song_number_groups_active.value.forEach(group_id => {
        var index = song_number_groups.value.indexOf(group_id);
        ids.push(index);
    });
    saveGroupOpened(route.fullPath, ids);
}

function getRangeString(start: string, end: string) {
    if (start == end) {
        return start;
    } else {
        return `${start} - ${end}`;
    }
}
</script>

<template>
    <div class="songs">
        <!-- Buttons with song grouping disabled -->
        <div v-if="!song_group_enabled" class="song-button-container">
            <RouterLink
                v-for="song_num in song_numbers"
                :key="song_num"
                :to="`/display/${props.book}/${song_num}`"
                class="song-btn"
                :style="{ background: button_color }"
            >
                {{ song_num }}
            </RouterLink>
        </div>
        <!-- Buttons with song grouping enabled -->
        <div v-else v-for="(group, index) in song_number_groups" :key="index" class="song-group-container" ref="song_group_elements">
            <div>
                <div class="song-group-title-container" @click="toggleDropdown(group)">
                    <div class="song-title">{{ getRangeString(group[0], group[group.length - 1]) }}</div>
                    <img
                        class="ionicon nav__icon dropdown-icon"
                        src="/assets/chevron-back-outline.svg"
                        :class="{ 'dropdown-icon-active': song_number_groups_active.includes(group) }"
                    />
                </div>
                <div class="wrapper" :class="{ 'wrapper-active': song_number_groups_active.includes(group) }">
                    <div class="song-button-container" :class="{ active: song_number_groups_active.includes(group) }">
                        <RouterLink
                            v-for="song_num in group"
                            :key="song_num"
                            :to="`/display/${props.book}/${song_num}`"
                            class="song-btn"
                            :style="{ background: button_color }"
                        >
                            {{ song_num }}
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.songs {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0px 10px 50px 10px;
}

.song-group-container {
    /*border: 1px solid #bebebe;*/
    box-shadow: var(--thin-shadow);
    background-color: var(--button-color);
    border-radius: 15px;
}

.song-group-title-container {
    margin: 15px 20px;
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
    padding-left: 10px;
    padding-right: 10px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.song-button-container.active {
    padding-bottom: 20px;
}

.song-btn {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    color: #fff;
    font-weight: 900;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
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
