<script setup lang="ts">
import { RouterLink } from "vue-router";
import { navigateBack } from "@/router/back_navigate";
</script>

<template>
    <div class="title">
        <img @click="navigateBack()" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>Attributions</h1>
        <span class="space"></span>
    </div>

    <div class="settings">
        <a href="https://ionic.io/ionicons" class="attribution">
            <h3 class="release">Ionicons</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">5.5.2</h5>
        </a>
        <a href="https://fonts.google.com/about" class="attribution">
            <h3 class="release">Google Fonts</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">4.0.0</h5>
        </a>
        <a href="https://tonejs.github.io" class="attribution">
            <h3 class="release">Tone.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">14.7.77</h5>
        </a>
        <a href="https://anvaka.github.io/panzoom/demo/attach-via-script.html" class="attribution">
            <h3 class="release">Avanka Panzoom</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">9.4.3</h5>
        </a>
        <div class="attribution">
            <h3 class="release" style="margin-bottom: 0px">Developers</h3>
            <ul style="margin-top: 5px">
                <li class="change">Christopher Weinhardt</li>
                <li class="change">Timothy Weinhardt</li>
                <li class="change">Dallas Hart</li>
            </ul>
        </div>
        <div class="attribution">
            <h3 class="release" style="margin-bottom: 0px">Contributors</h3>
            <ul style="margin-top: 5px">
                <li class="change">Joey Nitz</li>
                <li class="change">Susie Nitz</li>
                <li class="change">Neven Jokic</li>
                <li class="change">Riley Nenadov</li>
                <li class="change">Joel Walter</li>
                <li class="change">Leah Walter</li>
            </ul>
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
@import "@/assets/css/about-app.css";
</style>
