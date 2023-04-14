<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <div>
        <h1 class="pagetitle">Unknown Route</h1>
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
        <RouterLink to="/settings/import_songs" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style>
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
