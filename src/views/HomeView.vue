<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getBookUrls } from "@/scripts/book_import";
import { Capacitor } from "@capacitor/core";
import HomeBookBox from "@/components/HomeBookBox.vue";
import { onMounted, ref } from "vue";

const available_books = ref<string[]>([]);
onMounted(async () => {
    available_books.value = await getBookUrls();
});
</script>

<template>
    <div>
        <h1 class="pagetitle">Home</h1>
    </div>
    <div id="appsection">
        <HomeBookBox v-for="url in available_books" :key="url" :src="url"></HomeBookBox>
        <template v-if="Capacitor.getPlatform() === 'web'">
            <a class="app-button-container play-store-width" href="https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns">
                <img class="app-button" src="/assets/en_badge_web_generic.png" />
            </a>
            <a class="app-button-container app-store-width" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
                <img class="app-button" src="/assets/Appstore_badge.svg" />
            </a>
        </template>
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
#appsection {
    text-align: center;
    padding-bottom: 200px;
}

.app-button {
    width: 100%;
    display: inline-block;
    pointer-events: none;
}

.app-button-container {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
}

.app-store-width {
    max-width: 310px;
}

.play-store-width {
    max-width: 350px;
}
</style>

<style>
@import "@/assets/css/book.css";
</style>
