<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { RouterLink, useRouter } from "vue-router";
const router = useRouter();

let song_invert = useLocalStorage("songInverted", false);
let staggered_notes = useLocalStorage("staggered", false);
let playback_interval = useLocalStorage("playbackInterval", 0.25);
let playback_duration = useLocalStorage("playbackDuration", 3);
let override_system_theme = useLocalStorage("overrideSystemTheme", false);
let override_dark_mode = useLocalStorage("overrideDarkMode", false);
let panzoom_enabled = useLocalStorage("panzoomEnable", true);
</script>

<template>
    <div class="title">
        <img @click="router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>Options</h1>
        <span class="space"></span>
    </div>

    <h2>Theme</h2>
    <div class="settings">
        <div class="settings-option">
            <span>Invert Song Colors</span>
            <label class="switch">
                <input v-model="song_invert" type="checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div class="settings-option">
            <span>Enable Pan & Zoom</span>
            <label class="switch">
                <input v-model="panzoom_enabled" type="checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div class="settings-option">
            <span>Override System Theme</span>
            <label class="switch">
                <input v-model="override_system_theme" type="checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div v-show="override_system_theme" class="settings-option">
            <span>Dark Mode</span>
            <label class="switch">
                <input v-model="override_dark_mode" type="checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
    </div>
    <h2>Starting Notes</h2>
    <div class="settings">
        <div class="settings-option">
            <span>Staggered Playback</span>
            <label class="switch">
                <input v-model="staggered_notes" type="checkbox" />
                <span class="slider round"></span>
            </label>
        </div>
        <div class="settings-option">
            <span class="setting-label">Playback Interval</span>
            <input v-model="playback_interval" class="slider-setting" type="range" step="0.05" min="0.1" max="1" />
            <span class="slider-value">{{ playback_interval * 1000 }} ms</span>
        </div>
        <div class="settings-option">
            <span class="setting-label">Playback Duration</span>
            <input v-model="playback_duration" class="slider-setting" type="range" step="0.5" min="0.5" max="5" />
            <span class="slider-value">{{ playback_duration }} sec</span>
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
@import "/css/settings.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>
