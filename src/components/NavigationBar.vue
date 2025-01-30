<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
    current_page: string;
}>();
</script>
<template>
    <nav class="nav">
        <RouterLink to="/" class="nav__link" :class="{ 'nav__link--active': current_page == 'home'}">
            <img v-if="current_page == 'home'" class="ionicon nav__icon" src="/assets/home.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/home-outline.svg" />
            <span class="nav__text">Home</span>
        </RouterLink>
        <RouterLink to="/search" class="nav__link" :class="{ 'nav__link--active': current_page == 'search'}">
            <img v-if="current_page == 'search'" class="ionicon nav__icon" src="/assets/search.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </RouterLink>
        <RouterLink to="/bookmarks" class="nav__link" :class="{ 'nav__link--active': current_page == 'bookmarks'}">
            <img v-if="current_page == 'bookmarks'" class="ionicon nav__icon" src="/assets/bookmark.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
            <span class="nav__text">Bookmarks</span>
        </RouterLink>
        <RouterLink to="/settings" class="nav__link" :class="{ 'nav__link--active': current_page == 'settings'}">
            <img v-if="current_page == 'settings'" class="ionicon nav__icon" src="/assets/settings.svg" />
            <img v-else class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>