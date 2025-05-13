<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref } from "vue";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

defineProps<{
    current_page: string;
}>();

const hide_footer = ref<boolean>(false);

if (Capacitor.getPlatform() !== "web") {
    Keyboard.addListener("keyboardWillShow", () => {
        hide_footer.value = true;
    });
    Keyboard.addListener("keyboardWillHide", () => {
        hide_footer.value = false;
    });
}
</script>

<template>
    <nav class="nav" v-show="!hide_footer">
        <RouterLink to="/" class="nav__link" :class="{ 'nav__link--active': current_page == 'home' }">
            <img v-if="current_page == 'home'" class="ionicon nav__icon" src="/assets/home.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/home-outline.svg" />
            <span class="nav__text">Home</span>
        </RouterLink>
        <RouterLink to="/search" class="nav__link" :class="{ 'nav__link--active': current_page == 'search' }">
            <img v-if="current_page == 'search'" class="ionicon nav__icon" src="/assets/search.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </RouterLink>
        <RouterLink to="/bookmarks" class="nav__link" :class="{ 'nav__link--active': current_page == 'bookmarks' }">
            <img v-if="current_page == 'bookmarks'" class="ionicon nav__icon" src="/assets/bookmark.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
            <span class="nav__text">Bookmarks</span>
        </RouterLink>
        <RouterLink to="/settings" class="nav__link" :class="{ 'nav__link--active': current_page == 'settings' }">
            <img v-if="current_page == 'settings'" class="ionicon nav__icon" src="/assets/settings.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style scoped>
.nav {
    position: fixed;
    bottom: 0;
    width: 100%;
    min-height: 55px;
    box-shadow: var(--box-shadow);
    background-color: var(--toolbar);
    padding-top: 5px;
    padding-bottom: calc(env(safe-area-inset-bottom) + 5px);
    display: flex;
    z-index: 1;
}

.nav > * {
    flex: 1;
}

.nav__link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    min-width: 90px;
    overflow: hidden;
    white-space: nowrap;
    font-family: sans-serif;
    font-size: 13px;
    color: var(--toolbar-text);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    border-radius: 10px;
}

.nav__link--active {
    color: var(--toolbar-text-active);
}

.nav__text {
    padding-top: 3px;
    font-family: 'Lato', sans-serif;
}

.nav__icon {
    font-size: 23px;
    margin-bottom: 3px;
    width: 23px;
}
.nav__icon--active {
    font-size: 25px;
    margin-bottom: 3px;
    width: 25px;
    filter: var(--svg-color);
}
</style>
