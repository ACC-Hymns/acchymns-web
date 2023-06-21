<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
</script>

<template>
    <div class="title">
        <img @click="back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>Changelog</h1>
        <span class="space"></span>
    </div>
    <div class="settings-holder">
        <div class="settings">
            <a class="changelog">
                <h3 class="release" style="margin-bottom: 0px">[v2.0]</h3>
                <h5 class="releaseDate" style="color: rgb(200, 200, 200)">2022-06-01</h5>
                <ul style="margin-top: 5px">
                    <li class="change">Storage savings</li>
                    <li class="change">Increased visual fidelity</li>
                    <li class="change">Zoom and pan on songs</li>
                    <li class="change">Capability to import books</li>
                    <li class="change">Added Hymns of Zion</li>
                    <li class="change">Added Zbirka</li>
                    <li class="change">Added Pisne Chorale</li>
                    <li class="change">Added Japanese Zion's Harp</li>
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
                    <li class="change">Added Higher Ground</li>
                    <li class="change">Added Junior Hymnal</li>
                    <li class="change">Added Search Page</li>
                    <li class="change">Added Bookmarks Page</li>
                    <li class="change">Added Dark Theme</li>
                </ul>
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

<style>
@import "@/assets/css/settings.css";
@import "@/assets/css/about-app.css";
</style>
@/router/navigator