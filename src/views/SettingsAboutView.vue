<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();

// This is retrieved from the package.json
const version: string = import.meta.env.VITE_FULL_PROGRAM_VERSION;
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">About App</h1>
        </div>
    </div>

    <div class="main-content">
        <h2>ACC Hymns Version {{ version }}</h2>

        <div class="settings">
            <RouterLink to="/settings/about/attributions" class="settings-option">
                <span>Attributions</span>
                <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
            </RouterLink>
            <RouterLink to="/settings/about/changelog" class="settings-option">
                <span>Changelog</span>
                <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
            </RouterLink>
        </div>
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
