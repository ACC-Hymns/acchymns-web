<script setup lang="ts">
import { RouterLink } from "vue-router";
import { checkForUpdates, download_update_package, getBookFromId, getBookUrls, loadBookSources } from "@/scripts/book_import";
import { Capacitor } from "@capacitor/core";
import HomeBookBox from "@/components/HomeBookBox.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { onMounted, ref } from "vue";
import { Network } from "@capacitor/network";
import { useLocalStorage } from "@vueuse/core";
import { BookSourceType, type BookDataSummary, type UpdatePackage } from "@/scripts/types";
import BaseBookBox from "@/components/BaseBookBox.vue";

var hasConnection = ref<boolean>(false);
let import_books_tooltip_status = useLocalStorage<boolean>("import_books_tooltip_complete", false);
let update_reminder = useLocalStorage<number>("update_reminder", Date.now());
let tooltip = ref<Element>();
let update_packages = ref<UpdatePackage[]>([]);
let update_progress = ref<number>(0);
let update_background_element = ref();
let update_panel_element = ref();

const available_books = ref<string[]>([]);
const book_sources = ref<BookDataSummary[]>([]);

onMounted(async () => {
    book_sources.value = await loadBookSources();

    available_books.value = await getBookUrls();
    hasConnection.value = (await Network.getStatus()).connected;
    console.log("Connected to the internet: " + hasConnection.value);

    if(hasConnection && update_reminder.value <= Date.now()) {
        let update_results: UpdatePackage[] = await checkForUpdates();
        for(let update of update_results) {
            update.book_summary = await getBookFromId(update.book_short);
        }
        update_packages.value = update_results;
    }
});

function delayUpdate() {

    if(update_progress.value > 0)
        return;

    (update_background_element.value as unknown as HTMLElement).style.opacity = '0.0';
    (update_panel_element.value as unknown as HTMLElement).style.opacity = '0.0';
    setTimeout(() => {
        update_reminder.value = Date.now() + 86400000;
    }, 500);
}

async function startUpdate() {
    if(update_progress.value > 0)
        return;

    var progresses: number[] = [update_packages.value.length];
    for(let pkg_id = 0; pkg_id < update_packages.value.length; pkg_id++) {
        let pkg = update_packages.value[pkg_id];
        await download_update_package(pkg, (progress: number) => {
            progresses[pkg_id] = progress;
            update_progress.value = progresses.reduce((partialSum, a) => partialSum + a, 0)/update_packages.value.length
        }, () => {
            update_progress.value = 0;
            update_packages.value = [];
        })
    }
}

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
    <div :class="{'modal-open': update_packages.length > 0 && update_reminder <= Date.now()}">
        <div v-if="update_packages.length > 0 && update_reminder <= Date.now()" class="update-section">
            <div class="background-blur" ref="update_background_element">
            </div>
            <div class="update-panel" ref="update_panel_element">
                <h2>Hymnal Updates</h2>
                <p>Updates found for:</p>
                <div>
                    <div v-for="(update, update_index) in update_packages" :key="update.book_short">
                        <HomeBookBox v-if="update_index < 5" :src="update.book_summary?.srcUrl || ''" class="update-book-list-entry" :with-link="false"></HomeBookBox>
                        <div v-else-if="update_index == 5" class="update-book-list-entry more-update">
                            <h4>{{ update_packages.length - 5 }} more...</h4>
                        </div>
                    </div>
                </div>
                <div class="update-button-layout">
                    <a class="update-button" @click="delayUpdate" :style="{opacity: update_progress > 0 ? 0.3 : 1}">Later</a>
                    <a class="update-button-blue" @click="startUpdate">
                        <ProgressBar v-if="update_progress > 0" :radius="15" :progress="update_progress*100" :stroke="3" :transform="'rotate(-90) translate(-24, 0)'"></ProgressBar>
                        <span v-else>Update</span>
                    </a>
                </div>
            </div>
        </div>

        <div>
            <h1 class="pagetitle">Home</h1>
        </div>
        <div id="appsection">
            <HomeBookBox v-for="url in (hasConnection) ? available_books : available_books.filter(url => !url.startsWith('http'))" :key="url" :src="url"></HomeBookBox>
            <div v-if="!hasConnection">
                <div class="warning-label-container">
                    <img class="ionicon warning-icon" src="/assets/alert-circle-outline.svg" />
                    <h5 class="warning-label">The hymnals below require an internet connection</h5>
                </div>
                <BaseBookBox v-for="book in book_sources.filter(book => book.status == BookSourceType.IMPORTED)" :summary="book" :isEnabled="false"></BaseBookBox>
            </div>
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

.update-section {
    opacity: 1.0;
    transition: opacity 0.5s;
}

.more-update {
    background-color: var(--search-color);
    padding: 15px 20px;
    border-radius: 15px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.update-button-layout {
    margin: 30px;
    display: flex;
    justify-content: center;
}
.update-button-blue{
    width: 50px;
    height: 20px;
    background-color: #2196F3;
    color:white;
    padding: 15px;
    border-radius: 15px;
    margin: 0 0 0 15px;
}

.update-button {
    width: 50px;
    height: 20px;
    background-color: gray;
    color:white;
    padding: 15px;
    border-radius: 15px;
}

.update-book-list-entry {
    height: 20px;
    margin: 10px 0;
}

.background-blur {
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(1px);
    background-color: var(--overlay-color);
    position: fixed;    
    z-index: 5;
    opacity: 1;
    transition: opacity 0.5s;
}

.modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
}

.update-panel {
    width: 35vh;
    min-height: max-content;
    background-color: var(--div-color);
    border-radius: 15px;
    position: fixed;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    z-index: 6;
    transform: translate(-50%, -50%);
    transition: opacity 0.5s, visibility 0.5s ease;
    opacity: 1;
    text-align: center;
    padding: 15px;
    color: var(--color)
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

.warning-icon {
    width: 20px;
    display: inline-block;
    margin: 0 5px 0 0;
}
.warning-label-container {
    margin: 10px 30px;
    display: flex;
    justify-content: left;
    text-align: left;
}

.warning-label {
    color: var(--toolbar-text);
    display: inline-block;
    margin: 0 0;
    line-height: 25px;
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
