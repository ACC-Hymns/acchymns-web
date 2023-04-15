<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <div class="title">
        <a href="../../settings.html"><img class="ionicon" src="/assets/chevron-back-outline.svg"></a>
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
@import "/css/settings.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
