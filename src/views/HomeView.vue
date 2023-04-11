<script setup lang="ts">
import type { BookSummary } from "/js/types";
import { getAllBookMetaData } from "/js/book_import";
import { onMounted, ref } from "vue";
import { Capacitor } from "@capacitor/core";

let available_books = ref<BookSummary[]>([]);
onMounted(async () => {
    available_books.value = Object.values(await getAllBookMetaData());
});
</script>

<template>
    <div class="w-100">
        <div id="content">
            <h1 class="pagetitle">Home</h1>
        </div>
        <div id="appsection">
            <div v-for="book in available_books" :key="book.name.short">
                <a
                    :href="`selection.html?book=${book.name.short}`"
                    class="book"
                    :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`"
                >
                    <div class="book_title">{{ book.name.medium }}</div>
                    <img
                        v-if="book.addOn"
                        class="ionicon booktext--right"
                        style="
                            filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%)
                                contrast(93%);
                            width: 24px;
                        "
                        src="/assets/wifi.svg"
                    />
                </a>
            </div>
            <div v-if="Capacitor.getPlatform() === 'web'">
                <a class="app" href="https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns">
                    <img
                        class="appbuttonplay"
                        src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    />
                </a>
                <a class="app" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
                    <object class="appbuttonapple" data="./assets/Appstore_badge.svg"></object>
                </a>
            </div>
        </div>
        <nav class="nav">
            <a href="index.html" class="nav__link nav__link--active">
                <img class="ionicon nav__icon--active" src="/assets/home.svg" />
                <span class="nav__text">Home</span>
            </a>
            <a href="search.html" class="nav__link">
                <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
                <span class="nav__text">Search</span>
            </a>
            <a href="bookmarks.html" class="nav__link">
                <img class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
                <span class="nav__text">Bookmarks</span>
            </a>
            <a href="settings.html" class="nav__link">
                <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
                <span class="nav__text">Settings</span>
            </a>
        </nav>
    </div>
</template>

<style>
@import "/css/book.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
