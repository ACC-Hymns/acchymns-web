<script setup lang="ts">
import { computed, onUpdated, ref } from "vue";
import { Toast } from "@capacitor/toast";
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

// Not watching deeply, must assign new array

const imported_book_urls = useCapacitorPreferences<string[]>("externalBooks", []);
let import_books_tooltip_status = useLocalStorage<boolean>("import_books_tooltip_complete", false);

// Preview books are books that haven't been imported, and are publicly available
const preview_books_urls = computed(() => {
    return Object.values(public_references).filter(url => !imported_book_urls.value.includes(url));
});

const reference_input = ref("");

async function addImportedURL(url: string, show_on_success: boolean = true): Promise<boolean> {
    let resp: Response | null = null;
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        resp = await fetch(url + "/summary.json", {
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

    if (!imported_book_urls.value.includes(url)) {
        imported_book_urls.value.push(url);
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
        const to_import_url = known_references[short_book_name as keyof typeof known_references];
        // Check for duplicate url
        if (imported_book_urls.value.includes(to_import_url)) {
            await Toast.show({
                text: `Hymnal (${short_book_name}) already imported!`,
            });
        } else {
            if (await addImportedURL(to_import_url, false)) {
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

function download_progress(url: string, percentage: number) {
    downloadProgress.value.set(url, percentage);
}
function download_finish(url: string) {

}

onUpdated(() => {
    if (!import_books_tooltip_status.value) import_books_tooltip_status.value = true;
});

function removeImportedURL(to_remove: string) {
    imported_book_urls.value = imported_book_urls.value.filter(url => url != to_remove);
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
        <h2 v-if="preview_books_urls.length != 0">Available Hymnals</h2>
        <div v-if="preview_books_urls.length != 0" class="warning-label-container">
            <img class="ionicon warning-icon" src="/assets/alert-circle-outline.svg" />
            <h5 class="warning-label">The hymnals below require an internet connection</h5>
        </div>
        <div>
            <HomeBookBox v-for="url in preview_books_urls" :key="url" :src="url" :with-link="false">
                <button @click="addImportedURL(url)">
                    <img class="ionicon ionicon-custom booktext--right add-button-icon" src="/assets/add-circle-outline.svg" />
                </button>
            </HomeBookBox>
        </div>

        <!-- Imported Books -->
        <h2 v-if="imported_book_urls.length != 0">Imported Hymnals</h2>
        <div v-if="imported_book_urls.length != 0 && preview_books_urls.length == 0" class="warning-label-container">
            <img class="ionicon warning-icon" src="/assets/alert-circle-outline.svg" />
            <h5 class="warning-label">The hymnals below require an internet connection</h5>
        </div>
        <div style="padding-bottom: 200px">
            <HomeBookBox id="import-book" v-for="url in imported_book_urls" :key="url" :src="url" :with-link="false">
                <div class="button-array">
                    <button v-if="(downloadProgress.get(url || '') || 0) < 1" @click="download_book(url, (progress) => download_progress(url, progress), (url: string) => download_finish(url))">
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/arrow-down-circle-outline.svg" />
                    </button>
                    <ProgressBar v-if="(downloadProgress.get(url || '') || 0) >= 1 && (downloadProgress.get(url || '') || 0) < 100" :radius="15" :progress="(downloadProgress.get(url || '') || 0)" :stroke="3"></ProgressBar>
                    <button @click="removeImportedURL(url)">
                        <img class="ionicon ionicon-custom add-button-icon" src="/assets/close.svg" />
                    </button>
                </div>
            </HomeBookBox>
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
