<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">Changelog</h1>
        </div>
    </div>

    <div class="settings main-content">
        <a class="changelog">
            <h3 class="release" style="margin-bottom: 0px">[v3.0]</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">2024-07-01</h5>
            <ul style="margin-top: 5px">
                <li class="change">Bug fixes</li>
                <li class="change">Added song grouping</li>
                <li class="change">Added home customization</li>
                <li class="change">Added page flipping buttons</li>
                <li class="change">Added ability to download books for offline use</li>
                <li class="change">Added a media player for some hymnals</li>
                <li class="change">Added broadcasting to TVs</li>
                <li class="change">Added Hymns and Songs of Zion</li>
                <li class="change">Added Харфа Сиона</li>
            </ul>
        </a>
        <a class="changelog">
            <h3 class="release" style="margin-bottom: 0px">[v2.0]</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">2023-07-14</h5>
            <ul style="margin-top: 5px">
                <li class="change">Storage savings</li>
                <li class="change">Increased visual fidelity</li>
                <li class="change">Zoom and pan on songs</li>
                <li class="change">Starting note playback on songs</li>
                <li class="change">Importable books</li>
                <li class="change">Added Celebration Hymnal</li>
                <li class="change">Added Hymns of Zion</li>
                <li class="change">Added Zbirka</li>
                <li class="change">Added Hymns of Praise</li>
                <li class="change">Added Japanese Zion's Harp</li>
                <li class="change">Added German Zion's Harp</li>
                <li class="change">Added Hungarian Zion's Harp</li>
                <li class="change">Added Romanian Zion's Harp</li>
                <li class="change">Added Spanish Zion's Harp</li>
                <li class="change">Added Hangoljátok Szíveteket</li>
                <li class="change">Added Pisne Chorale</li>
                <li class="change">Bug fixes</li>
            </ul>
        </a>
        <a class="changelog">
            <h3 class="release" style="margin-bottom: 0px">[v1.1]</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">2022-07-16</h5>
            <ul style="margin-top: 5px">
                <li class="change">Added missing songs</li>
                <li class="change">Visual improvments</li>
            </ul>
        </a>
        <a class="changelog">
            <h3 class="release" style="margin-bottom: 0px">[v1.0]</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">2022-07-15</h5>
            <ul style="margin-top: 5px">
                <li class="change">Added Zion's Harp</li>
                <li class="change">Added Gospel Hymns</li>
                <li class="change">Added Camp Book</li>
                <li class="change">Added Junior Hymnal</li>
                <li class="change">Added Search Page</li>
                <li class="change">Added Bookmarks Page</li>
                <li class="change">Added Dark Theme</li>
            </ul>
        </a>
    </div>

    <NavigationBar current_page="settings" />
</template>

<style>
@import "@/assets/css/settings.css";
@import "@/assets/css/about-app.css";
</style>
