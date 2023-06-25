<script setup lang="ts">
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
import { RouterLink } from "vue-router";
import { clearCache } from "@/composables/cached_fetch";
import { resetOptions } from "@/stores/options";
import { Toast } from "@capacitor/toast";
import { Dialog } from "@capacitor/dialog";

// This is retrieved from the package.json
const version: string = import.meta.env.VITE_FULL_PROGRAM_VERSION;
const is_prerelease = version.includes("Beta") || version.includes("Alpha");

async function clearFetchCache() {
    const confirmed = await Dialog.confirm({
        title: "Clear Cache",
        message: "Are you sure you want to clear the cache?",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
    });

    if (confirmed.value) {
        clearCache();
        Toast.show({
            text: "Cleared Cache!",
        });
    }
}

async function resetAllOptions() {
    const confirmed = await Dialog.confirm({
        title: "Reset Options",
        message: "Are you sure you want to reset your options?",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
    });

    if (confirmed.value) {
        resetOptions();
        Toast.show({
            text: "Reset Options!",
        });
    }
}

async function clearAllData() {
    const confirmed = await Dialog.confirm({
        title: "Clear All Data",
        message: "Are you sure you want to clear ALL your data? This includes bookmarks and imported books!",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
    });

    if (confirmed.value) {
        localStorage.clear();
        Toast.show({
            text: "Cleared All Data!",
        });
    }
}
</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>Help</h1>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="settings">
            <a href="https://forms.gle/Ezh7d8LFsN5eKdo87" class="settings-option">
                <span>Report a Bug</span>
                <img class="ionicon" src="/assets/link-outline.svg" />
            </a>
            <RouterLink v-if="is_prerelease" to="/settings/about/console" class="settings-option">
                <span>Debug Console</span>
                <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
            </RouterLink>
            <a class="settings-option" @click="clearFetchCache()">
                <span>Clear Cache</span>
            </a>
            <a class="settings-option" @click="resetAllOptions()">
                <span>Reset Options</span>
            </a>
            <a class="settings-option" @click="clearAllData()">
                <span>Clear All Data</span>
            </a>
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

<style scoped>
@import "@/assets/css/settings.css";

.entrypoint {
    cursor: pointer;
}
</style>
