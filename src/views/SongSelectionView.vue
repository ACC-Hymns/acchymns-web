<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

const song_numbers = ref<string[]>([]);
let book_name = ref("");
let index_available = ref(false);
let button_color = ref("#000000");

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songs = await getSongMetaData(props.book);
    song_numbers.value = Object.keys(songs).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
    index_available.value = BOOK_METADATA[props.book].indexAvailable;
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>{{ book_name }}</h1>
            </div>
            <div class="title--right">
                <RouterLink v-if="index_available" :to="`/topical/${props.book}`">
                    <img class="ionicon" src="/assets/information-circle-outline.svg" />
                </RouterLink>
            </div>
        </div>
    </div>

    <div class="songs" style="margin-top: 70px">
        <!-- Buttons will be added here -->
        <RouterLink v-for="song_num in song_numbers" :key="song_num" :to="`/display/${props.book}/${song_num}`" class="song-btn" :style="{ background: button_color }">
            {{ song_num }}
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

<style scoped>
.songs {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0px 10px 110px 10px;
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
</style>
