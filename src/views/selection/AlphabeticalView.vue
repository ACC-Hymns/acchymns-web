<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue";
import { getAllBookMetaData, getSongMetaData } from "@/scripts/book_import";
import { RouterLink, onBeforeRouteLeave, useRoute } from "vue-router";
import type { Song } from "@/scripts/types";
import { saveScrollPosition, restoreScrollPosition, removeGroupOpened, removeScrollPosition } from "@/router/scroll";

const route = useRoute();
const props = { book: route.params.book as string };

let book_ref = ref("");
let primary_color = ref("#FFFFFF");
let secondary_color = ref("#000000");

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
    for (const song_number of Object.keys(BOOK_SONG_METADATA)) {
        let song: Song = BOOK_SONG_METADATA[song_number];
        alphabeticalSongs.value.push({
            title: song?.title ?? "",
            number: song_number,
            notes: song?.notes,
            first_line: song?.first_line,
        });
    }
    alphabeticalSongs.value.sort((a, b) =>
        a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")),
    );

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
});

const alphabeticalSongs = ref<Song[]>([]);
</script>

<template>
    <div>
        <RouterLink
            v-for="song in alphabeticalSongs"
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
</template>

<style>
@import "@/assets/css/song.css";
</style>
