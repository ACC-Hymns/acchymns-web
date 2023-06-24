<script setup lang="ts">
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
import { RouterLink } from "vue-router";
import { clearCache } from "@/composables/cached_fetch";
import { clearOptions } from "@/stores/options";
import { Toast } from "@capacitor/toast";

// This is retrieved from the package.json
const version: string = import.meta.env.VITE_FULL_PROGRAM_VERSION;
const is_prerelease = version.includes("Beta") || version.includes("Alpha");

function clearFetchCache() {
    clearCache();
    Toast.show({
        text: "Cleared Cache!",
    });
}

function clearAllOptions() {
    clearOptions();
    Toast.show({
        text: "Cleared Options!",
    });
}

function clearAllData() {
    localStorage.clear();
    Toast.show({
        text: "Cleared All Data!",
    });
}
</script>

<template>
    <div class="title">
        <img @click="back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>Help</h1>
        <span class="space"></span>
    </div>

    <div class="settings">
        <a href="https://forms.gle/Ezh7d8LFsN5eKdo87" class="settings-option">
            <span>Report a Bug</span>
            <img class="ionicon" src="/assets/link-outline.svg" />
        </a>
        <RouterLink v-if="is_prerelease" to="/settings/about/console" class="settings-option">
            <span>Debug Console</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
        </RouterLink>
        <a class="settings-option">
            <span>Clear Cache</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" @click="clearFetchCache()" />
        </a>
        <a class="settings-option">
            <span>Clear Options</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" @click="clearAllOptions()" />
        </a>
        <a class="settings-option">
            <span>Clear All Data</span>
            <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" @click="clearAllData()" />
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

<style scoped>
@import "@/assets/css/settings.css";

.entrypoint {
    cursor: pointer;
}
</style>
