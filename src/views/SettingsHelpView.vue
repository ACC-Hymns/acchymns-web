<script setup lang="ts">
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
import { RouterLink } from "vue-router";
import { clearCache } from "@/composables/cached_fetch";
import { Toast } from "@capacitor/toast";
import { Dialog } from "@capacitor/dialog";
import { Preferences } from "@capacitor/preferences";
import { download_update_package, generate_force_update_package, getBookFromId, loadBookSources } from "@/scripts/book_import";
import { ref } from "vue";
import type { UpdatePackage } from "@/scripts/types";
import HomeBookBox from "@/components/HomeBookBox.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { Capacitor } from "@capacitor/core";
import NavigationBar from "@/components/NavigationBar.vue";

// This is retrieved from the package.json
const version: string = import.meta.env.VITE_FULL_PROGRAM_VERSION;
const is_prerelease = version.includes("Beta") || version.includes("Alpha");
const isWeb = Capacitor.getPlatform() === "web"
let update_packages = ref<UpdatePackage[]>([]);
let update_progress = ref<number>(0);
let update_background_element = ref();
let update_panel_element = ref();

async function clearFetchCache() {
    const confirmed = await Dialog.confirm({
        title: "Clear Cache",
        message: "Are you sure you want to clear the cache?",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
    });

    if (confirmed.value) {
        clearCache();
        Toast.show({
            text: "Cleared Cache!",
        });
    }
}

async function forceUpdate() {
    let updates = await generate_force_update_package();
    for(let update of updates) {
        update.book_summary = await getBookFromId(update.book_short);
    }
    update_packages.value = updates;
}

function delayUpdate() {

    if(update_progress.value > 0)
        return;

    (update_background_element.value as unknown as HTMLElement).style.opacity = '0.0';
    (update_panel_element.value as unknown as HTMLElement).style.opacity = '0.0';

    update_packages.value = []
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

async function clearAllData() {
    const confirmed = await Dialog.confirm({
        title: "Clear All Data",
        message: "Are you sure you want to clear ALL your data? This includes bookmarks and imported books!",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
    });

    if (confirmed.value) {
        localStorage.clear();
        Preferences.remove({ 'key': "bookSources"});
        Preferences.remove({ 'key': "bookOrder"});
        loadBookSources();
        Toast.show({
            text: "Cleared All Data!",
        });
    }
}
</script>

<template>
    <div :class="{'modal-open': update_packages.length > 0}">
        <div v-if="update_packages.length > 0" class="update-section">
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

        <div class="menu">
            <div class="title">
                <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
                <h1 class="title--center">Help</h1>
            </div>
        </div>

        <div class="settings main-content">
            <a href="https://forms.gle/Ezh7d8LFsN5eKdo87" class="settings-option">
                <span>Report a Bug</span>
                <img class="ionicon" src="/assets/link-outline.svg" />
            </a>
            <a href="https://docs.google.com/document/d/1zWztUrFOr_6ksqDDm4EbQ0jk7trwofaVeeSybcD5PcA" class="settings-option">
                <span>Privacy Policy</span>
                <img class="ionicon" src="/assets/link-outline.svg" />
            </a>
            <RouterLink v-if="is_prerelease" to="/settings/help/console" class="settings-option">
                <span>Debug Console</span>
                <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
            </RouterLink>
            <a v-if="!isWeb" class="settings-option" @click="forceUpdate()">
                <span>Force Update Hymnals</span>
            </a>
            <a class="settings-option" @click="clearFetchCache()">
                <span>Clear Cache</span>
            </a>
            <a class="settings-option" @click="clearAllData()">
                <span>Clear All Data</span>
            </a>
        </div>
    </div>

    <NavigationBar current_page="settings" />
</template>

<style scoped>
@import "@/assets/css/settings.css";

.entrypoint {
    cursor: pointer;
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
    background-color: var(--blue);
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
</style>
