<script setup lang="ts">
import { useLocalStorage, useMediaQuery } from "@vueuse/core";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();

let staggered_notes = useLocalStorage("ACCOptions.staggered", true);
let playback_interval = useLocalStorage("ACCOptions.playbackInterval", 0.25);
let playback_duration = useLocalStorage("ACCOptions.playbackDuration", 2.5);
let song_group_enabled = useLocalStorage("ACCOptions.songGroupEnabled", true);

const system_prefers_dark_mode = useMediaQuery("(prefers-color-scheme: dark)");
const override_system_theme = useLocalStorage("ACCOptions.overrideSystemTheme", false);
const user_prefers_dark_mode = useLocalStorage("ACCOptions.overrideDarkMode", false);
let song_invert = useLocalStorage("ACCOptions.songInverted", false);

const dark_mode = computed(() => {
    if (override_system_theme.value) {
        return user_prefers_dark_mode.value;
    } else {
        return system_prefers_dark_mode.value;
    }
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">Options</h1>
        </div>
    </div>

    <div class="main-content">
        <h2>Accessibility</h2>
        <div class="settings">
            <div class="settings-option">
                <span>Group Songs by Number</span>
                <label class="switch">
                    <input v-model="song_group_enabled" type="checkbox" />
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
        <h2>Theme</h2>
        <div class="settings">
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
                    <input v-model="user_prefers_dark_mode" type="checkbox" />
                    <span class="slider round"></span>
                </label>
            </div>
            <div v-show="dark_mode" class="settings-option">
                <span>Invert Song Colors</span>
                <label class="switch">
                    <input v-model="song_invert" type="checkbox" />
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
            <div v-show="staggered_notes" class="settings-option">
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
