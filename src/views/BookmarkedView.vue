<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getAllSongMetaData, getAllBookMetaData } from "@/scripts/book_import";
import { computed, ref, onMounted } from "vue";
import type { SongReference, SongSearchInfo, Song } from "@/scripts/types";
import { stripSearchText } from "@/scripts/search";
import { useCapacitorPreferences } from "@/composables/preferences";
import NavigationBar from "@/components/NavigationBar.vue";
import { Keyboard } from "@capacitor/keyboard";
import draggable from "vuedraggable";

let search_query = ref("");
let stripped_query = computed(() => {
    return stripSearchText(search_query.value);
});
let available_songs = ref<SongSearchInfo[]>([]);

let search_results = computed(() => {
    return available_songs.value
        .filter(s => {
            return (
                s.stripped_title?.includes(stripped_query.value) ||
                s?.stripped_first_line?.includes(stripped_query.value) ||
                s?.number?.includes(stripped_query.value)
            );
        })
        .sort((a, b) => a.title.localeCompare(b.title));
});

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);

type Folder = {
    title: string;
    open: boolean;
    items: BookmarkItem[];
};

enum PositionType {
    SONG = "song",
    FOLDER = "folder",
}

type BookmarkItem = {
    type: PositionType;
    data: SongSearchInfo | Folder;
};

let positions = ref<BookmarkItem[]>([]);
let editting = ref(false);
let holdTimeout = ref<number | null>(null);

async function move_item(e: ReorderEvent) {
    console.log(JSON.parse(JSON.stringify(positions.value)));
}

function move_sub_item(e: ReorderEvent, index: number) {
    console.log(JSON.parse(JSON.stringify(positions.value)));
}

function create_folder() {
    const folder: Folder = {
        title: "New Folder",
        open: false,
        items: [],
    };
    positions.value.push({
        type: PositionType.FOLDER,
        data: folder,
    });
}

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
    for(const song of available_songs.value) {
        positions.value.push({
            type: PositionType.SONG,
            data: song,
        });
    }
});

const hide_footer = ref<boolean>(false);

Keyboard.addListener("keyboardDidShow", () => {
    hide_footer.value = true;
});
Keyboard.addListener("keyboardDidHide", () => {
    hide_footer.value = false;
});

function getDirection() {
    return "vertical";
}

let dragOptions = computed(() => {
    return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        direction: getDirection(),
        fallbackOnBody: true,
    };
});

type ReorderEvent = {
    moved: {
        element: BookmarkItem;
        newIndex: number;
        oldIndex: number;
    };
};
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
    <div class="bookmark-toolbar">
        <h2 class="status-text">{{ editting ? "Edit Bookmarks" : "All Bookmarks" }}</h2>
        <div class="edit-buttons">
            <a v-if="!editting" @click="create_folder" class="confirm-text-container">
                <img class="ionicon" src="/assets/folder-open-outline.svg" />
            </a>
            <a v-if="!editting" @click="editting = !editting" class="confirm-text-container">
                <img class="ionicon" src="/assets/create-outline.svg" />
            </a>
            <a v-else @click="editting = !editting" class="confirm-text-container">
                <h3 class="confirm-text">Confirm</h3>
                <img class="ionicon" src="/assets/checkmark-circle-outline.svg" />
            </a>
        </div>
        
    </div>
    <div class="songlist">
        <div v-if="editting">
            <draggable
                :list="positions"
                :component-data="{
                    tag: 'div',
                    type: 'transition-group',
                    name: 'flip-list',
                }"
                v-bind="dragOptions"
                :key="positions.length"
                @change="move_item"
                item-key="item"
                handle=".handle"
                :scroll="true"
                :scrollSensitivity="1"
                :forceFallback="true"
            >
                <template #item="{ element, index }">
                    <div>
                        <div v-if="element.type == PositionType.SONG"
                            :key="(element.data as SongSearchInfo).book.name.short + (element.data as SongSearchInfo).number"
                            :to="`/display/${(element.data as SongSearchInfo).book.name.short}/${(element.data as SongSearchInfo).number}`"
                            class="song"
                            :style="`background: linear-gradient(135deg, ${(element.data as SongSearchInfo).book.primaryColor}, ${(element.data as SongSearchInfo).book.secondaryColor}); margin-bottom: 10px`"
                        >
                            <div>
                                <div class="song__title">{{ (element.data as SongSearchInfo).title }}</div>
                                <div class="book__title">{{ (element.data as SongSearchInfo).book.name.medium }}</div>
                            </div>
                            <div class="booktext--right">
                                <div class="song__number">#{{ (element.data as SongSearchInfo).number }}</div>
                                <img class="ionicon handle" style="filter: invert(100%)" src="/assets/drag-handle.svg" />
                            </div>
                        </div>
                        <div v-if="element.type == PositionType.FOLDER" class="folder-container">
                            <div class="folder-title-container">
                                <div>
                                    <div class="song-title edit-text">{{ (element.data as Folder).title }}
                                        <img class="ionicon edit-text-icon" style="filter: invert(100%)" src="/assets/pencil.svg" /></div>
                                    <div class="item-count">{{ (element.data as Folder).items.length }} item{{ ((element.data as Folder).items.length == 1) ? "" : "s" }}</div>
                                </div>
                                <img class="ionicon handle" style="filter: invert(100%)" src="/assets/drag-handle.svg" />
                            </div>
                            <div class="wrapper" :class="{ 'wrapper-active': true }">
                                <draggable
                                    :list="(element.data as Folder).items"
                                    :key="(element.data as Folder).items.length"
                                    :component-data="{
                                        tag: 'div',
                                        type: 'transition-group',
                                        name: 'flip-list',
                                    }"
                                    v-bind="dragOptions"
                                    @change="(e: ReorderEvent) => move_sub_item(e, index)"
                                    item-key="item"
                                    handle=".handle"
                                    :scroll="true"
                                    :scrollSensitivity="1"
                                    :forceFallback="true"
                                    class="content-button-container"
                                    :class="{ 'content-button-container-active': true }"
                                >
                                    <template #item="{ element: song }">
                                        <div 
                                        class="song topic-song"
                                        :style="`background: linear-gradient(135deg, ${song.data.book.primaryColor}, ${song.data.book.secondaryColor})`"
                                        >
                                            <div>
                                                <div class="song__title">{{ song.data.title }}</div>
                                                <div class="book__title">{{ song.data.book.name.medium }}</div>
                                            </div>
                                            <div class="booktext--right">
                                                <div class="song__number">#{{ song.data.number }}</div>
                                                <img class="ionicon handle" style="filter: invert(100%)" src="/assets/drag-handle.svg" />
                                            </div>
                                        </div>
                                    </template>
                                </draggable>

                                <div v-if="(element.data as Folder).items.length == 0" class="empty-folder">
                                    Empty Folder
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
        <div v-else v-for="item in positions" :key="item.data.title">
            <div v-if="item.type == PositionType.FOLDER" class="folder-container">
                <div class="folder-title-container" @click="(item.data as Folder).open = !(item.data as Folder).open">
                    <div>
                        <div class="song-title">{{ (item.data as Folder).title }}</div>
                        <div class="item-count">{{ (item.data as Folder).items.length }} item{{ ((item.data as Folder).items.length == 1) ? "" : "s" }}</div>
                    </div>
                    <img
                        class="ionicon nav__icon dropdown-icon"
                        src="/assets/chevron-back-outline.svg"
                        :class="{ 'dropdown-icon-active': (item.data as Folder).open }"
                    />
                </div>
                <div class="wrapper" :class="{ 'wrapper-active': (item.data as Folder).open }">
                    <div
                        class="content-button-container"
                        :class="{ 'content-button-container-active': (item.data as Folder).open }"
                    >
                        <RouterLink
                            v-for="song in (item.data as Folder).items"
                            :key="(song.data as SongSearchInfo).book.name.short + (song.data as SongSearchInfo).number"
                            :to="`/display/${(song.data as SongSearchInfo).book.name.short}/${(song.data as SongSearchInfo).number}`"
                            class="song topic-song"
                            :style="`background: linear-gradient(135deg, ${(song.data as SongSearchInfo).book.primaryColor}, ${(song.data as SongSearchInfo).book.secondaryColor})`"
                        >
                            <div>
                                <div class="song__title">{{ (song.data as SongSearchInfo).title }}</div>
                                <div class="book__title">{{ (song.data as SongSearchInfo).book.name.medium }}</div>
                            </div>
                            <div class="booktext--right">
                                <div class="song__number">#{{ (song.data as SongSearchInfo).number }}</div>
                            </div>
                        </RouterLink>

                        <div v-if="(item.data as Folder).items.length == 0 && (item.data as Folder).open" class="empty-folder">
                            Empty Folder
                        </div>
                    </div>
                </div>
            </div>
            <RouterLink v-else-if="item.type == PositionType.SONG"
                :key="(item.data as SongSearchInfo).book.name.short + (item.data as SongSearchInfo).number"
                :to="`/display/${(item.data as SongSearchInfo).book.name.short}/${(item.data as SongSearchInfo).number}`"
                class="song"
                :style="`background: linear-gradient(135deg, ${(item.data as SongSearchInfo).book.primaryColor}, ${(item.data as SongSearchInfo).book.secondaryColor})`"
            >
                <div>
                    <div class="song__title">{{ (item.data as SongSearchInfo).title }}</div>
                    <div class="book__title">{{ (item.data as SongSearchInfo).book.name.medium }}</div>
                </div>
                <div class="booktext--right">
                    <div class="song__number">#{{ (item.data as SongSearchInfo).number }}</div>
                </div>
            </RouterLink>
        </div>
    </div>

    <NavigationBar current_page="bookmarks" v-if="!hide_footer" />
</template>

<style>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";
.bookmark-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    height: 48px;
}

.status-text {
    line-height: 48px;
    margin: 0;
}

.edit-buttons {
    display: flex;
    gap: 15px;
}

.handle {
    width: 30px;
    height: 30px;
    cursor: pointer;
}

.edit-text {
    cursor: pointer;
    background-color: var(--button-tap);
    border-radius: 5px;
    padding: 8px 8px 10px 8px;
    font-style: italic;
}

.edit-text-icon {
    width: 19px;
    height: 19px;
    transform: translateY(5px);
    cursor: pointer;
}

.confirm-text-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
.confirm-text {
    color: var(--back-color);
    font-size: 15px;
}

.sortable-fallback {
    opacity: 1 !important;
}

.ghost {
    opacity: 0;
}
.flip-list-move {
    transition: transform 0.5s;
}
.empty-folder {
    color: var(--back-color);
    text-align: center;
    font-style: italic;
}

.folder-container {
    /*border: 1px solid #bebebe;*/
    box-shadow: var(--thin-shadow);
    background-color: var(--button-color);
    border-radius: 15px;
    margin: 5px 20px;
    padding: 15px;
}

.folder-title-container {
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

.item-count {
    color: var(--back-color);
    font-style: italic;
    padding-top: 5px;
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

.content-button-container {
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.content-button-container-active {
    margin-top: 15px;
}

.topic-song {
    width: 100%;
    margin: 5px 0 !important;
}
</style>
