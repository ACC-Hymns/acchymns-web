<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { resetOptions } from "@/stores/options";
import { Dialog } from "@capacitor/dialog";
import { Toast } from "@capacitor/toast";
import { RouterLink } from "vue-router";

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

    <h2>General</h2>
    <div class="settings">
        <RouterLink to="/settings/options" class="settings-option">
            <span>Preferences</span>
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
        <a class="settings-option" @click="resetAllOptions()">
            <span>Reset Settings</span>
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

<style>
@import "@/assets/css/settings.css";
</style>
