<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <h1 class="pagetitle">Settings</h1>
    <h2>Info</h2>
    <div class="settings">
        <RouterLink to="/settings/about" class="settings-option">
            <span>About App</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
        </RouterLink>
        <RouterLink to="/settings/help" class="settings-option">
            <span>Help</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
        </RouterLink>
    </div>

    <h2>Preferences</h2>
    <div class="settings">
        <RouterLink to="/settings/options" class="settings-option">
            <span>Options</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
        </RouterLink>
        <RouterLink to="/settings/import" class="settings-option">
            <span>Import Hymnals</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
        </RouterLink>
        <RouterLink to="/settings/connect" class="settings-option">
            <span>Broadcast</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
        </RouterLink>
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
