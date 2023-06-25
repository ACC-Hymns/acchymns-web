<script setup lang="ts">
import { computed, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Toast } from "@capacitor/toast";
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
import HomeBookBox from "@/components/HomeBookBox.vue";
import { known_references, public_references } from "@/scripts/constants";

// Not watching deeply, must assign new array
const imported_book_urls = useLocalStorage<string[]>("externalBooks", []);

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
                text: `Failed to load book!`,
            });
            return false;
        }
        if (e.name != "AbortError") {
            throw e;
        }
    }

    if (resp == null || !resp.ok || resp.status != 200) {
        await Toast.show({
            text: `Failed to load book!`,
        });
        return false;
    }

    if (!imported_book_urls.value.includes(url)) {
        imported_book_urls.value.push(url);
        if (show_on_success) {
            await Toast.show({
                text: `Successfully imported book!`,
            });
        }
        return true;
    } else {
        await Toast.show({
            text: `Book already imported!`,
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
                text: `Book (${short_book_name}) already imported!`,
            });
        } else {
            if (await addImportedURL(to_import_url, false)) {
                await Toast.show({
                    text: `Successfully imported book (${short_book_name})!`,
                });
            }
        }
    } else {
        // Unknown code
        await Toast.show({
            text: `Unknown book reference (${short_book_name})!`,
        });
    }
}

function removeImportedURL(to_remove: string) {
    imported_book_urls.value = imported_book_urls.value.filter(url => url != to_remove);
}
</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>Import Books</h1>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div style="display: flex; justify-content: center">
            <h5 style="margin: 0 auto">The song books below require an internet connection</h5>
        </div>
        <div class="settings">
            <div class="input-option">
                <span>Reference</span>
                <input v-model.trim="reference_input" type="text" class="input-text" />
                <button :disabled="reference_input.length === 0" @click="addImportedBookByCode(reference_input)">
                    <img class="ionicon" src="/assets/chevron-forward-outline.svg" />
                </button>
            </div>
        </div>

        <!-- Publicly available, but not imported books -->
        <h2 v-if="preview_books_urls.length != 0">Available Books</h2>
        <div>
            <HomeBookBox v-for="url in preview_books_urls" :key="url" :src="url" :with-link="false">
                <button @click="addImportedURL(url)">
                    <img class="ionicon ionicon-custom" src="/assets/add-circle-outline.svg" />
                </button>
            </HomeBookBox>
        </div>

        <!-- Imported Books -->
        <h2 v-if="imported_book_urls.length != 0">Imported Books</h2>
        <div style="padding-bottom: 200px">
            <HomeBookBox v-for="url in imported_book_urls" :key="url" :src="url" :with-link="false">
                <button @click="removeImportedURL(url)">
                    <img class="ionicon ionicon-custom" src="/assets/close.svg" />
                </button>
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
.ionicon-custom {
    filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%);
}

.book {
    max-height: 50px;
}
</style>
