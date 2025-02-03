<script setup lang="ts">
import { computed, onBeforeUnmount, onUpdated, ref } from "vue";
import { Toast } from "@capacitor/toast";
import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";
import HomeBookBox from "@/components/HomeBookBox.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import { known_references, public_references } from "@/scripts/constants";
import { useCapacitorPreferences } from "@/composables/preferences";
import { useLocalStorage } from "@vueuse/core";
import { download_book, loadBookSources, delete_import_summary, download_import_summary } from "@/scripts/book_import";
import { BookSourceType, type BookDataSummary, type DownloadPromise } from "@/scripts/types";
import { Directory, Filesystem } from "@capacitor/filesystem";
import NavigationBar from "@/components/NavigationBar.vue";

let downloadProgress = ref(new Map<string, number>());
let downloads = ref<Map<string, DownloadPromise>>(new Map<string, DownloadPromise>());
onBeforeUnmount(async () => {
    downloads.value.forEach(async (value, key) => {
        await value.cancel();
        downloadProgress.value.delete(key);
    });
});

const book_sources = useCapacitorPreferences<BookDataSummary[]>("bookSources", []);
let import_books_tooltip_status = useLocalStorage<boolean>("import_books_tooltip_complete", false);

// Preview books are books that haven't been imported, and are publicly available
const preview_books = computed(() => {
    let books = book_sources.value.filter(book => book.status == BookSourceType.PREVIEW);
    return books;
});

// Imported books
const imported_books = computed(() => {
    return book_sources.value.filter(book => book.status == BookSourceType.IMPORTED);
});

// Downloaded books
const downloaded_books = computed(() => {
    return book_sources.value.filter(book => book.status == BookSourceType.DOWNLOADED);
});

const reference_input = ref("");

async function addImportedURL(input_book: BookDataSummary, show_on_success: boolean = true): Promise<boolean> {
    let book = book_sources.value.find(b => b.id == input_book.id);
    if (book == undefined) return false;

    let connection = (await Network.getStatus()).connected;
    if (connection) {
        if (Capacitor.getPlatform() !== "web") await download_import_summary(book);
    } else {
        await Toast.show({
            text: "No internet connection.",
        });
        return false;
    }

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
    short_book_name = short_book_name.toUpperCase();
    if (short_book_name in known_references) {
        const to_import = book_sources.value.find(b => b.id == short_book_name);
        if (to_import == undefined) return;

        // Check for duplicate url
        if (to_import.status == BookSourceType.IMPORTED || to_import.status == BookSourceType.DOWNLOADED) {
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

async function download(book_to_download: BookDataSummary) {
    if ((await Network.getStatus()).connected) {
        let d: DownloadPromise = download_book(
            book_to_download,
            (book, progress) => download_progress(book, progress),
            (book, url: string) => download_finish(book, url),
        );
        downloads.value.set(book_to_download.id, d);
    } else {
        await Toast.show({
            text: "No internet connection.",
        });
    }
    console.log("Downloads:", downloads.value);
}
async function download_progress(book: BookDataSummary, percentage: number) {
    downloadProgress.value.set(book.id, percentage);
}
async function download_finish(book: BookDataSummary, new_url: string) {
    book.src = new_url;
    book.status = BookSourceType.DOWNLOADED;
    await Toast.show({
        text: "Successfully downloaded hymnal!",
    });
}

onUpdated(() => {
    if (!import_books_tooltip_status.value) import_books_tooltip_status.value = true;
});

async function removeImportedURL(book_to_remove: BookDataSummary) {
    book_to_remove.status = Object.keys(public_references).includes(book_to_remove.id) ? BookSourceType.PREVIEW : BookSourceType.HIDDEN;

    if (downloads.value.has(book_to_remove.id)) {
        downloads.value.get(book_to_remove.id)?.cancel();
        downloadProgress.value.delete(book_to_remove.id);
    }

    if (Capacitor.getPlatform() !== "web") await delete_import_summary(book_to_remove);

    await Toast.show({
        text: "Successfully removed hymnal!",
    });
}
async function deleteBook(book_to_delete: BookDataSummary) {
    book_to_delete.status = BookSourceType.IMPORTED;
    book_to_delete.src = known_references[book_to_delete.id as keyof typeof known_references];
    await Filesystem.rmdir({
        directory: Directory.Documents,
        path: `Hymnals/${book_to_delete.id}`,
        recursive: true,
    });

    downloadProgress.value.delete(book_to_delete.id);

    loadBookSources();
    await Toast.show({
        text: "Successfully deleted hymnal!",
    });
}

import { Keyboard } from "@capacitor/keyboard";

const hide_footer = ref<boolean>(false);

Keyboard.addListener("keyboardDidShow", () => {
    hide_footer.value = true;
});
Keyboard.addListener("keyboardDidHide", () => {
    hide_footer.value = false;
});
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
            <input v-model.trim="reference_input" type="text" class="search-bar" placeholder="Book Code" />
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
                    <button v-if="(downloadProgress.get(book.id) || 0) < 1 && Capacitor.getPlatform() !== 'web'" @click="download(book)">
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/arrow-down-circle-outline.svg" />
                    </button>
                    <ProgressBar
                        v-if="
                            (downloadProgress.get(book.id || '') || 0) >= 1 &&
                            (downloadProgress.get(book.id || '') || 0) < 100 &&
                            Capacitor.getPlatform() !== 'web'
                        "
                        :radius="15"
                        :progress="downloadProgress.get(book.id || '') || 0"
                        :stroke="3"
                        :transform="'rotate(-90) translate(-25 -8)'"
                    ></ProgressBar>
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
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/trash-outline.svg" />
                    </button>
                </div>
            </HomeBookBox>
        </div>

        <div style="padding-bottom: 200px"></div>
    </div>

    <NavigationBar current_page="settings" v-if="!hide_footer" />
</template>

<style>
@import "@/assets/css/settings.css";
@import "@/assets/css/book.css";
</style>

<style scoped>
.side-button {
    all: unset;
    cursor: pointer;
    height: 44px;
}
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
