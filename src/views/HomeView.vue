<script setup lang="ts">
import type { BookSummary } from "@/scripts/types";
import { RouterLink } from "vue-router";
import { getAllBookMetaData } from "@/scripts/book_import";
import { onMounted, ref } from "vue";
import { Capacitor } from "@capacitor/core";

let available_books = ref<BookSummary[]>([]);
onMounted(async () => {
    available_books.value = Object.values(await getAllBookMetaData());
});
</script>

<template>
    <div>
        <h1 class="pagetitle">Home</h1>
    </div>
    <div id="appsection">
        <div v-for="book in available_books" :key="book.name.short">
            <RouterLink :to="`selection/${book.name.short}`" class="book" :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`">
                <div class="book_title">{{ book.name.medium }}</div>
                <img v-if="book.addOn || Capacitor.getPlatform() === 'web'" class="ionicon booktext--right" style="filter: invert(100%)" src="/assets/wifi.svg" />
            </RouterLink>
        </div>
        <div v-if="Capacitor.getPlatform() === 'web'">
            <a class="app" href="https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns">
                <img class="appbuttonplay" src="/assets/en_badge_web_generic.png" />
            </a>
            <a class="app" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
                <object class="appbuttonapple" data="/assets/Appstore_badge.svg"></object>
            </a>
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

<style scoped>
#appsection {
    text-align: center;
    padding-bottom: 200px;
}
</style>

<style>
@import "/css/book.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
