<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
    <div class="title">
        <img @click="router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>Help</h1>
        <span class="space"></span>
    </div>

    <div class="settings">
        <a href="https://forms.gle/Ezh7d8LFsN5eKdo87" class="settings-option">
            <span>Report a Bug</span>
            <img class="ionicon" src="/assets/link-outline.svg" />
        </a>
    </div>

    <nav class="nav">
        <RouterLink to="/" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/home-outline.svg" />
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
        <RouterLink to="/settings" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/settings.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style>
@import "@/assets/css/settings.css";
</style>
