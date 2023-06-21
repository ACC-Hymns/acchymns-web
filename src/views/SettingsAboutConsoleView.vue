<script setup lang="ts">
import { RouterLink } from "vue-router";
import { navigateBack } from "@/router/back_navigate";
import { useConsoleStore } from "@/stores/console";

const console = useConsoleStore();
</script>

<template>
    <div class="title">
        <img @click="navigateBack()" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>System Logs</h1>
        <span class="space"></span>
    </div>

    <div class="settings">
        <div class="internal-console" v-html="console.logs.replaceAll('\n', '<br>')"></div>
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
@import "@/assets/css/about-app.css";

.settings {
    height: calc(100vh - 65px - 61.16px - 40px);
}

p {
    margin: 0px;
}

.internal-console {
    height: 100%;
    border-radius: 15px;
    padding: 25px;
    margin: 20px;
    color: var(--color);
    background: var(--background);
    overflow: auto;
    white-space: pre;
}
</style>
