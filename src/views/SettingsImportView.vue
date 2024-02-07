<script setup lang="ts">
import { computed, onUpdated, ref } from "vue";
import { Toast } from "@capacitor/toast";
import { Network } from '@capacitor/network';
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
import HomeBookBox from "@/components/HomeBookBox.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { known_references, public_references } from "@/scripts/constants";
import { useCapacitorPreferences } from "@/composables/preferences";
import { useLocalStorage } from "@vueuse/core";
import router from "@/router";
import { download_book } from "@/scripts/book_import";
import { BookSourceType, type BookDataSummary } from "@/scripts/types";

// Not watching deeply, must assign new array

const imported_book_urls = useCapacitorPreferences<string[]>("externalBooks", []);
const book_sources = useCapacitorPreferences<BookDataSummary[]>("bookSources", []);
let import_books_tooltip_status = useLocalStorage<boolean>("import_books_tooltip_complete", false);

// Preview books are books that haven't been imported, and are publicly available
const preview_books = computed(() => {
    let books = book_sources.value.filter((book) => book.status == BookSourceType.PREVIEW);
    return books;
});

// Imported books
const imported_books = computed(() => {
    return book_sources.value.filter((book) => book.status == BookSourceType.IMPORTED);
});

// Downloaded books
const downloaded_books = computed(() => {
    return book_sources.value.filter((book) => book.status == BookSourceType.DOWNLOADED);
});

const reference_input = ref("");

async function addImportedURL(input_book: BookDataSummary, show_on_success: boolean = true): Promise<boolean> {
    let book = book_sources.value.find(book => book.id == input_book.id);
    if(book == undefined)
        return false;

    let resp: Response | null = null;
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        resp = await fetch(book.src + "/summary.json", {
            method: "HEAD",
            signal: controller.signal,
        });
        clearTimeout(id);
    } catch (e: any) {
        if (e.name == "TypeError") {
            await Toast.show({
                text: `Failed to load hymnal!`,
            });
            return false;
        }
        if (e.name != "AbortError") {
            throw e;
        }
    }

    if (resp == null || !resp.ok || resp.status != 200) {
        await Toast.show({
            text: `Failed to load hymnal!`,
        });
        return false;
    }

    if (book.status != BookSourceType.IMPORTED) {
        book.status = BookSourceType.IMPORTED;
        if (show_on_success) {
            await Toast.show({
                text: `Successfully imported hymnal!`,
            });
        }
        return true;
    } else {
        await Toast.show({
            text: `Hymnal already imported!`,
        });
        return false;
    }
}

async function addImportedBookByCode(short_book_name: string) {
    if (short_book_name in known_references) {
        const to_import = book_sources.value.find(book => book.id = short_book_name); 
        if(to_import == undefined)
            return;

        // Check for duplicate url
        if (to_import.status == BookSourceType.IMPORTED) {
            await Toast.show({
                text: `Hymnal (${short_book_name}) already imported!`,
            });
        } else {
            if (await addImportedURL(to_import, false)) {
                await Toast.show({
                    text: `Successfully imported hymnal (${short_book_name})!`,
                });
            }
        }
    } else {
        // Unknown code
        await Toast.show({
            text: `Unknown hymnal reference (${short_book_name})!`,
        });
    }
}

let downloadProgress = ref(new Map<string, number>());

async function download(book_to_download: BookDataSummary) {
    if((await Network.getStatus()).connected)
        download_book(book_to_download, (book, progress) => download_progress(book, progress), (book, url: string) => download_finish(book, url))
    else {
        await Toast.show({
            text: "No internet connection."
        })
    }
}
function download_progress(book: BookDataSummary, percentage: number) {
    downloadProgress.value.set(book.id, percentage);
}
function download_finish(book: BookDataSummary, new_url: string) {
    book.src = new_url;
    book.status = BookSourceType.DOWNLOADED;
}

onUpdated(() => {
    if (!import_books_tooltip_status.value) import_books_tooltip_status.value = true;
});

function removeImportedURL(book_to_remove: BookDataSummary) {
    book_to_remove.status = BookSourceType.PREVIEW;
}
function deleteBook(book_to_delete: BookDataSummary) {
    book_to_delete.status = BookSourceType.IMPORTED;
    book_to_delete.src = eval(`public_references.${book_to_delete.id}`);
}

</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="$router.back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">Import Hymnals</h1>
        </div>
    </div>

    <div class="main-content">
        <div class="input-option reference-option">
            <input v-model.trim="reference_input" type="text" class="search-bar" placeholder="Reference" />
            <a :disabled="reference_input.length === 0" @click="addImportedBookByCode(reference_input)" class="reference-button">
                <img class="ionicon enter-button-icon" src="/assets/enter-outline.svg" />
            </a>
        </div>

        <!-- Publicly available, but not imported books -->
        <h2 v-if="preview_books.length != 0">Available Hymnals</h2>
        <div v-if="preview_books.length != 0" class="warning-label-container">
            <img class="ionicon warning-icon" src="/assets/alert-circle-outline.svg" />
            <h5 class="warning-label">The hymnals below require an internet connection</h5>
        </div>
        <div>
            <HomeBookBox v-for="book in preview_books" :key="book.id" :src="book.src" :with-link="false">
                <button @click="addImportedURL(book)">
                    <img class="ionicon ionicon-custom booktext--right add-button-icon" src="/assets/add-circle-outline.svg" />
                </button>
            </HomeBookBox>
        </div>

        <!-- Imported Books -->
        <h2 v-if="imported_books.length != 0">Imported Hymnals</h2>
        <div v-if="imported_books.length != 0 && preview_books.length == 0" class="warning-label-container">
            <img class="ionicon warning-icon" src="/assets/alert-circle-outline.svg" />
            <h5 class="warning-label">The hymnals below require an internet connection</h5>
        </div>
        <div>
            <HomeBookBox id="import-book" v-for="book in imported_books" :key="book.id" :src="book.src" :with-link="false">
                <div class="button-array">
                    <button v-if="(downloadProgress.get(book.id) || 0) < 1" @click="download(book)">
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/arrow-down-circle-outline.svg" />
                    </button>
                    <ProgressBar v-if="(downloadProgress.get(book.id || '') || 0) >= 1 && (downloadProgress.get(book.id || '') || 0) < 100" :radius="15" :progress="(downloadProgress.get(book.id || '') || 0)" :stroke="3"></ProgressBar>
                    <button @click="removeImportedURL(book)">
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/close.svg" />
                    </button>
                </div>
            </HomeBookBox>
        </div>


        <!-- Downloaded Books -->
        <h2 v-if="downloaded_books.length != 0">Downloaded Hymnals</h2>
        <div>
            <HomeBookBox id="import-book" v-for="book in downloaded_books" :key="book.id" :src="book.src" :with-link="false">
                <div class="button-array">
                    <button @click="deleteBook(book)">
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/close.svg" />
                    </button>
                </div>
            </HomeBookBox>
        </div>

        <div style="padding-bottom: 200px"></div>
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
@import "@/assets/css/book.css";
</style>

<style scoped>
.button-array {
    display: flex;
    flex-direction: row;
    vertical-align: middle;
    align-items: center;
    justify-content: center;
    gap: 20px;
}
.add-button-icon {
    vertical-align: middle;
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

.ionicon-custom {
    filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%);
}

.book {
    max-height: 50px;
}

.reference-option {
    border-bottom: 0;
}

.enter-button-icon {
    translate: -2px 4px;
}

.reference-button {
    background-color: var(--div-color);
    border-radius: 15px;
    padding: 5px 10px;
    box-shadow: 0 0 15px rgb(0, 0, 0, 0.1);
    height: 32px;
}

.search-bar {
    background-color: var(--search-color);
    height: 30px;
    border-radius: 15px;
    margin: 0px 15px 0px 0px;
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>
