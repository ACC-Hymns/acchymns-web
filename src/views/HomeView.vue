<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getBookUrls, loadBookSources } from "@/scripts/book_import";
import { Capacitor } from "@capacitor/core";
import HomeBookBox from "@/components/HomeBookBox.vue";
import { onMounted, ref } from "vue";
import { Network } from "@capacitor/network";
import { useLocalStorage } from "@vueuse/core";

var hasConnection = ref<boolean>(false);
let import_books_tooltip_status = useLocalStorage<boolean>("import_books_tooltip_complete", false);
let tooltip = ref<Element>();

const available_books = ref<string[]>([]);
onMounted(async () => {
    await loadBookSources();
    available_books.value = await getBookUrls();
    hasConnection.value = (await Network.getStatus()).connected;
    console.log("Connected to the internet: " + hasConnection.value);
});

function hideTooltip() {
    tooltip.value?.classList.add("tooltiphidden");
    tooltip.value?.classList.add("tooltip");
    setTimeout(() => {
        import_books_tooltip_status.value = true;
    }, 1000);
}

function tooltipVisible(visible: boolean) {
    return visible ? "padding-top: 50px;" : "";
}
</script>

<template>
    <div>
        <h1 class="pagetitle">Home</h1>
    </div>
    <div id="appsection">
        <HomeBookBox v-for="url in available_books" :key="url" :src="url"></HomeBookBox>
        <div @click="hideTooltip">
            <RouterLink to="/settings/import" v-if="hasConnection">
                <img class="ionicon import-books-button" src="/assets/add-circle-outline.svg" />
            </RouterLink>
            <div v-if:="!import_books_tooltip_status && hasConnection" class="tooltip" ref="tooltip">
                <p class="tooltiptext">New! More Hymnals</p>
            </div>
        </div>

        <template v-if="Capacitor.getPlatform() === 'web'">
            <a class="app-button-container play-store-width" href="https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns" :style="tooltipVisible(!import_books_tooltip_status)">
                <img class="app-button" src="/assets/en_badge_web_generic.png" />
            </a>
            <a class="app-button-container app-store-width" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
                <img class="app-button" src="/assets/Appstore_badge.svg" />
            </a>
        </template>
    </div>
    <nav class="nav">
        <RouterLink to="/" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/home.svg" />
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
        <RouterLink to="/settings" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style scoped>
#appsection {
    text-align: center;
    padding-bottom: 200px;
}

.app-button {
    width: 100%;
    display: inline-block;
    pointer-events: none;
}

.app-button-container {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
}
.app-store-width {
    max-width: 310px;
}

.play-store-width {
    max-width: 350px;
}
.import-books-button {
    width: 50px;
    height: 50px;
}

.tooltip {
    min-width: 160px;
    height: 25px;
    background-color: #2196f3;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.25);
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    translate: 0 10px;
    margin: 0 calc(50% - 80px);
    opacity: 1;
}

.tooltiphidden {
    background-color: #2196f3;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.25);
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    translate: 0 10px;
    margin: 0 calc(50% - 80px);
    opacity: 0;
    transition: opacity 500ms ease;
}

.tooltip::after {
    content: "";
    position: absolute;
    bottom: 100%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent #2196f3 transparent;
}

.tooltiptext {
    margin: 0px 10px;
    line-height: 25px;
    font-size: 15px;
    color: white;
}
</style>

<style>
@import "@/assets/css/book.css";
</style>
