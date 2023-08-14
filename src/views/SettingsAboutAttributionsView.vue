<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
import package_json from "@/../package.json";

const { dependencies } = package_json;

function clean_version(version: string) {
    return version.replace(/^[^0-9]+/, "");
}

const { back } = useNavigator();
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">Attributions</h1>
        </div>
    </div>

    <div class="settings main-content">
        <a href="https://tonejs.github.io" class="attribution">
            <h3 class="release">Tone.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.tone) }}</h5>
        </a>
        <a href="https://anvaka.github.io/panzoom/demo/attach-via-script.html" class="attribution">
            <h3 class="release">Avanka Panzoom</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.panzoom) }}</h5>
        </a>
        <a href="https://mozilla.github.io/pdf.js/" class="attribution">
            <h3 class="release">PDF.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["pdfjs-dist"]) }}</h5>
        </a>
        <a href="https://vuejs.org/" class="attribution">
            <h3 class="release">Vue.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.vue) }}</h5>
        </a>
        <a href="https://vuejs.org/" class="attribution">
            <h3 class="release">Vue Router</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["vue-router"]) }}</h5>
        </a>
        <a href="https://capacitorjs.com/" class="attribution">
            <h3 class="release">Capacitor</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["@capacitor/core"]) }}</h5>
        </a>
        <a href="https://github.com/ionic-team/pwa-elements" class="attribution">
            <h3 class="release">Ionic PWA Elements</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["@ionic/pwa-elements"]) }}</h5>
        </a>
        <a href="https://ionic.io/ionicons" class="attribution">
            <h3 class="release">Ionicons</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">5.5.2</h5>
        </a>
        <a href="https://fonts.google.com/about" class="attribution">
            <h3 class="release">Google Fonts</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">4.0.0</h5>
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
@import "@/assets/css/about-app.css";
</style>
