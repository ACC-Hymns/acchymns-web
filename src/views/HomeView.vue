<script setup lang="ts">
import { RouterLink, onBeforeRouteLeave, useRoute } from "vue-router";
import { checkForUpdates, download_update_package, getBookFromId, loadBookSources } from "@/scripts/book_import";
import { Capacitor } from "@capacitor/core";
import HomeBookBox from "@/components/HomeBookBox.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { computed, nextTick, onMounted, ref } from "vue";
import { Network } from "@capacitor/network";
import { useLocalStorage } from "@vueuse/core";
import { BookSourceType, type BookDataSummary, type SongReference, type UpdatePackage } from "@/scripts/types";
import BaseBookBox from "@/components/BaseBookBox.vue";
import draggable from "vuedraggable";
import { Preferences } from "@capacitor/preferences";
import { restoreScrollPosition, saveScrollPosition } from "@/router/scroll";
import { clearCache } from "@/composables/cached_fetch";
import NavigationBar from "@/components/NavigationBar.vue";
import { useReportAPI } from "@/composables/report";

let is_connected = ref<boolean>(false);
let update_reminder = useLocalStorage<number>("update_reminder", Date.now());
let update_packages = ref<UpdatePackage[]>([]);
let update_progress = ref<number>(0);
let update_background_element = ref();
let update_panel_element = ref();
let is_editing_order = ref<boolean>(false);

// Saving position in book
onBeforeRouteLeave((_, from) => {
    saveScrollPosition(from.fullPath);
});

const route = useRoute();

function getDirection() {
    return "vertical";
}

let dragOptions = computed(() => {
    return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        direction: getDirection(),
    };
});

const book_sources = ref<BookDataSummary[]>([]);
let customized_books = ref<BookDataSummary[]>([]);

async function sort_books() {
    let book_order = JSON.parse((await Preferences.get({ key: "bookOrder" })).value || "[]") as string[];
    let available_books = book_sources.value.filter(book => filter_book(book, is_connected.value));
    let temp_books: BookDataSummary[] = [];
    for (let id of book_order) {
        if (available_books.find(book => book.id == id)) {
            temp_books.push(available_books.find(book => book.id == id) as BookDataSummary);
            available_books.splice(
                available_books.findIndex(book => book.id == id),
                1,
            );
        }
    }
    temp_books = temp_books.concat(available_books);
    temp_books.forEach(async book => {
        let summary = book_sources.value.find(source => source.id == book.id);
        book.primaryColor = summary?.primaryColor;
        book.secondaryColor = summary?.secondaryColor;
        book.name = summary?.name;
    });

    customized_books.value = temp_books;
}

onMounted(async () => {
    is_connected.value = (await Network.getStatus()).connected;
    console.log("Connected to the internet: " + is_connected.value);

    book_sources.value = await loadBookSources();
    await sort_books();

    if (is_connected && update_reminder.value <= Date.now()) {
        let update_results: UpdatePackage[] = await checkForUpdates();
        for (let update of update_results) {
            update.book_summary = await getBookFromId(update.book_short);
        }
        update_packages.value = update_results;
    }

    Network.addListener("networkStatusChange", async () => {
        is_connected.value = (await Network.getStatus()).connected;
        console.log("Connected to the internet: " + is_connected.value);

        book_sources.value = await loadBookSources();
        await sort_books();
    });

    // Restoring position in book
    await nextTick();
    // The v-for for song buttons now should be active, so we can scroll to the saved position
    restoreScrollPosition(route.fullPath);
});

type BookOrderEvent = {
    moved: {
        element: BookDataSummary;
        newIndex: number;
        oldIndex: number;
    };
};
async function move_book(e: BookOrderEvent) {
    let book_order = customized_books.value.map(book => book.id);
    let moved_book = e.moved.element;
    book_order.splice(e.moved.oldIndex, 1);
    book_order.splice(e.moved.newIndex, 0, moved_book.id);
    Preferences.set({ key: "bookOrder", value: JSON.stringify(book_order) });
    await sort_books();
}

function delayUpdate() {
    if (update_progress.value > 0) return;

    (update_background_element.value as unknown as HTMLElement).style.opacity = "0.0";
    (update_panel_element.value as unknown as HTMLElement).style.opacity = "0.0";
    setTimeout(() => {
        update_reminder.value = Date.now() + 86400000;
    }, 500);
}

async function startUpdate() {
    if (update_progress.value > 0) return;

    var progresses: number[] = [update_packages.value.length];
    for (let pkg_id = 0; pkg_id < update_packages.value.length; pkg_id++) {
        let pkg = update_packages.value[pkg_id];
        await download_update_package(
            pkg,
            (progress: number) => {
                progresses[pkg_id] = progress;
                update_progress.value = progresses.reduce((partialSum, a) => partialSum + a, 0) / update_packages.value.length;
            },
            () => {
                update_progress.value = 0;
                update_packages.value = [];
            },
        );
    }

    clearCache();
}

function filter_book(book: BookDataSummary, hasConnection: boolean) {
    return (
        book.status == BookSourceType.BUNDLED || book.status == BookSourceType.DOWNLOADED || (hasConnection && book.status == BookSourceType.IMPORTED)
    );
}
</script>

<template>
    <div :class="{ 'modal-open': update_packages.length > 0 && update_reminder <= Date.now() }">
        <div v-if="update_packages.length > 0 && update_reminder <= Date.now()" class="update-section">
            <div class="background-blur" ref="update_background_element"></div>
            <div class="update-panel" ref="update_panel_element">
                <h2>Hymnal Updates</h2>
                <p>Updates found for:</p>
                <div>
                    <div v-for="(update, update_index) in update_packages" :key="update.book_short">
                        <HomeBookBox
                            v-if="update_index < 5"
                            :src="update.book_summary?.srcUrl || ''"
                            class="update-book-list-entry"
                            :with-link="false"
                        ></HomeBookBox>
                        <div v-else-if="update_index == 5" class="update-book-list-entry more-update">
                            <h4>{{ update_packages.length - 5 }} more...</h4>
                        </div>
                    </div>
                </div>
                <div class="update-button-layout">
                    <a class="update-button" @click="delayUpdate" :style="{ opacity: update_progress > 0 ? 0.3 : 1 }">Later</a>
                    <a class="update-button-blue" @click="startUpdate">
                        <ProgressBar
                            v-if="update_progress > 0"
                            :radius="15"
                            :progress="update_progress * 100"
                            :stroke="3"
                            :transform="'rotate(-90) translate(-24, 0)'"
                        ></ProgressBar>
                        <span v-else>Update</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="page-heading">
            <h1>Home</h1>
            <a v-if="!is_editing_order" @click="is_editing_order = !is_editing_order" class="confirm-text-container">
                <img class="ionicon" src="/assets/create-outline.svg" />
            </a>
            <a v-else @click="is_editing_order = !is_editing_order" class="confirm-text-container">
                <h3 class="confirm-text">Confirm</h3>
                <img class="ionicon" src="/assets/checkmark-circle-outline.svg" />
            </a>
        </div>
        <div id="appsection">
            <div v-if="is_editing_order">
                <draggable
                    :list="customized_books.filter(book => filter_book(book, is_connected))"
                    :component-data="{
                        tag: 'div',
                        type: 'transition-group',
                        name: 'flip-list',
                    }"
                    v-bind="dragOptions"
                    :key="customized_books.filter(book => filter_book(book, is_connected)).length"
                    @change="(e: BookOrderEvent) => move_book(e)"
                    item-key="book"
                    handle=".handle"
                    :scroll="false"
                    :scrollSensitivity="0"
                    :forceFallback="true"
                >
                    <template #item="{ element }">
                        <BaseBookBox :summary="element">
                            <img class="ionicon booktext--right handle" style="filter: invert(100%)" src="/assets/drag-handle.svg" />
                        </BaseBookBox>
                    </template>
                </draggable>
            </div>
            <div v-else>
                <HomeBookBox
                    v-for="book in customized_books.filter(book => filter_book(book, is_connected))"
                    :key="book.id"
                    :src="book.src"
                ></HomeBookBox>
            </div>

            <div v-if="!is_connected">
                <div v-if="book_sources.filter(book => book.status == BookSourceType.IMPORTED).length > 0" class="warning-label-container">
                    <img class="ionicon warning-icon" src="/assets/alert-circle-outline.svg" />
                    <h5 class="warning-label">The hymnals below require an internet connection</h5>
                </div>
                <BaseBookBox
                    v-for="book in book_sources.filter(book => book.status == BookSourceType.IMPORTED)"
                    :key="book.id"
                    :summary="book"
                    :isEnabled="false"
                ></BaseBookBox>
            </div>

            <div>
                <RouterLink to="/settings/import" v-if="is_connected">
                    <img class="ionicon import-books-button" src="/assets/add-circle-outline.svg" />
                </RouterLink>
            </div>

            <template v-if="Capacitor.getPlatform() === 'web'">
                <a class="app-button-container play-store-width" href="https://play.google.com/store/apps/details?id=com.ChristopherW.acchmns">
                    <img class="app-button" src="/assets/en_badge_web_generic.png" />
                </a>
                <a class="app-button-container app-store-width" href="https://apps.apple.com/us/app/acc-hymns/id1634426405">
                    <img class="app-button" src="/assets/Appstore_badge.svg" />
                </a>
            </template>
        </div>
    </div>

    <NavigationBar current_page="home" />
</template>

<style scoped>
.sortable-fallback {
    opacity: 1 !important;
}

.ghost {
    opacity: 0;
}
.flip-list-move {
    transition: transform 0.5s;
}
.confirm-text-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
.confirm-text {
    color: var(--back-color);
    font-size: 15px;
}
.page-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 55px 30px 20px 30px;
    height: 39px;
}

#appsection {
    text-align: center;
    padding-bottom: 200px;
}

.handle {
    width: 30px;
    height: 30px;
    cursor: pointer;
}

.update-section {
    opacity: 1;
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
.update-button-blue {
    width: 50px;
    height: 20px;
    background-color: var(--blue);
    color: white;
    padding: 15px;
    border-radius: 15px;
    margin: 0 0 0 15px;
}

.update-button {
    width: 50px;
    height: 20px;
    background-color: var(--cancel-button-color);
    color: white;
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
    transform: translateY(-55px);
}

.modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
}

.update-panel {
    width: 70vw;
    min-height: max-content;
    background-color: var(--div-color);
    border-radius: 15px;
    position: fixed;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    z-index: 6;
    transform: translate(-50%, -50%);
    transition:
        opacity 0.5s,
        visibility 0.5s ease;
    opacity: 1;
    text-align: center;
    padding: 15px;
    color: var(--color);
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
</style>

<style>
@import "@/assets/css/book.css";
</style>
