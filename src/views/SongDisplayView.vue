<script setup lang="ts">
import SongContainer from "@/components/SongContainer.vue";
import { onMounted, ref, computed, onUnmounted } from "vue";
import { getSongMetaData } from "@/scripts/book_import";
import { useRouter } from "vue-router";
import type { SongReference } from "@/scripts/types";
import { useNotes } from "@/composables/notes";
import { useCapacitorPreferences } from "@/composables/preferences";

const props = defineProps<SongReference>();

const router = useRouter();

const { player, isPlaying } = useNotes();
const notes = ref<string[]>([]);

const bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
const is_bookmarked = computed(() => {
    return -1 != bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
});

function toggleBookmark() {
    if (!is_bookmarked.value) {
        bookmarks.value.push(props as SongReference);
    } else {
        const index = bookmarks.value.findIndex(bookmark => bookmark.book == props.book && bookmark.number == props.number);
        bookmarks.value.splice(index, 1); // Remove the bookmarked song
    }
}

onMounted(async () => {
    const SONG_METADATA = await getSongMetaData(props.book);
    notes.value = (SONG_METADATA[props.number]?.notes ?? []).reverse(); // Reverse as we want bass -> soprano
});

onUnmounted(() => {
    player.stop();
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>#{{ props.number }}</h1>
            </div>
            <div class="title--right">
                <template v-if="notes.length != 0">
                    <img v-if="!isPlaying" @click="player.play(notes)" class="ionicon" src="/assets/musical-notes-outline.svg" />
                    <img v-else class="ionicon" src="/assets/musical-notes.svg" />
                </template>

                <img v-if="is_bookmarked" @click="toggleBookmark()" class="ionicon" src="/assets/bookmark.svg" />
                <img v-else @click="toggleBookmark()" class="ionicon" src="/assets/bookmark-outline.svg" />
            </div>
        </div>
    </div>
    <div class="w-100" style="height: 100vh">
        <SongContainer :book="props.book" :number="props.number"></SongContainer>
    </div>
</template>
