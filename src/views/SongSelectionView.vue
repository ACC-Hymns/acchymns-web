<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

let num_of_songs = ref(0);
let book_name = ref("");
let index_available = ref(false);
let button_color = ref("#000000");

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    num_of_songs.value = BOOK_METADATA[props.book].numOfSongs;
    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
    const index = await getBookIndex(BOOK_METADATA[props.book].name.short);
    index_available.value = index != undefined;
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            <h1>{{ book_name }}</h1>
            <RouterLink :to="`/topical/${props.book}`">
                <img class="ionicon" :class="{ hidden: !index_available }" src="/assets/information-circle-outline.svg" />
            </RouterLink>
        </div>
    </div>

    <div class="songs" style="margin-top: 70px">
        <!-- Buttons will be added here -->
        <RouterLink v-for="song_num in num_of_songs" :key="song_num" :to="`/display/${$props.book}/${song_num}`" class="song-btn" :style="{ background: button_color }">
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
