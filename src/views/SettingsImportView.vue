<script setup lang="ts">
import { fetchBookSummary } from "@/scripts/book_import";
import type { BookSummary } from "@/scripts/types";
import { watch, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Capacitor } from "@capacitor/core";
import { RouterLink, useRouter } from "vue-router";
const router = useRouter();

const branch = "staging";

const public_references = {
    HZ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/HZ`,
    ZG: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZG`,
    PC: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/PC`,
    ZHJ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZHJ`,
};

const known_references = {
    HZ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/HZ`,
    ZG: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZG`,
    ARF: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARF`,
    ARFR: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ARFR`,
    PC: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/PC`,
    ZHJ: `https://raw.githubusercontent.com/ACC-Hymns/acchymns-web/${branch}/books/ZHJ`,
};

let imported_book_urls = useLocalStorage<string[]>("externalBooks", []); // Not watching deeply, must assign new array

const url_input = ref("");
const reference_input = ref("");

// Imported books & updating
let imported_books = ref<BookSummary[]>([]);
watch(
    imported_book_urls,
    async urls => {
        imported_books.value = await Promise.all(urls.map(url => fetchBookSummary(url)));
    },
    { immediate: true }
);

// Preview books & updating
let preview_books = ref<BookSummary[]>([]);
watch(
    imported_book_urls,
    async urls => {
        let preview_urls = Object.values(public_references).filter(url => !urls.includes(url));
        preview_books.value = await Promise.all(preview_urls.map(url => fetchBookSummary(url)));
    },
    { immediate: true }
);

function addImportedURL(url: string) {
    if (!imported_book_urls.value.includes(url)) {
        imported_book_urls.value = [...imported_book_urls.value, url];
    }
}

function addImportedBookByCode(short_book_name: string) {
    if (short_book_name in known_references) {
        addImportedURL(known_references[short_book_name as keyof typeof known_references]);
    }
}

function addImportedBook(book: BookSummary) {
    if (book.srcUrl !== undefined) {
        addImportedURL(book.srcUrl);
    } else {
        addImportedBookByCode(book.name.short);
    }
}

function removeImportedURL(to_remove: string) {
    imported_book_urls.value = imported_book_urls.value.filter(url => url != to_remove);
}

function removeImportedBookByCode(short_book_name: string) {
    if (short_book_name in known_references) {
        removeImportedURL(known_references[short_book_name as keyof typeof known_references]);
    }
}

function removeImportedBook(book: BookSummary) {
    if (book.srcUrl !== undefined) {
        removeImportedURL(book.srcUrl);
    } else {
        removeImportedBookByCode(book.name.short);
    }
}
</script>

<template>
    <div class="title">
        <img @click="router.go(-1)" class="ionicon" src="/assets/chevron-back-outline.svg" />
        <h1>Import Books</h1>
        <span class="space"></span>
    </div>
    <div style="display: flex; justify-content: center">
        <h5 style="margin: 0 auto">The song books below require an internet connection</h5>
    </div>
    <div class="settings">
        <div class="input-option">
            <span>Reference</span>
            <input v-model.trim="reference_input" type="text" />
            <button :disabled="reference_input.length === 0" @click="addImportedBookByCode(reference_input)">
                <img class="ionicon" src="/assets/chevron-forward-outline.svg" />
            </button>
        </div>
        <div class="input-option">
            <span>URL</span>
            <input v-model="url_input" type="url" />
            <button :disabled="url_input.length === 0" @click="addImportedURL(url_input)">
                <img class="ionicon" src="/assets/chevron-forward-outline.svg" />
            </button>
        </div>
    </div>

    <!-- Publicly available, but not imported books -->
    <h2 v-if="preview_books.length != 0">Available Books</h2>
    <div>
        <div v-for="book in preview_books" :key="book.srcUrl" class="book" :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`">
            <div>
                <div class="book_title_small">{{ book.name.medium }}</div>
            </div>
            <div class="booktext--right">
                <button @click="addImportedBook(book)">
                    <img class="ionicon ionicon-custom" src="/assets/add-circle-outline.svg" />
                </button>
            </div>
        </div>
    </div>

    <!-- Imported Books -->
    <h2 v-if="imported_books.length != 0">Imported Books</h2>
    <div style="padding-bottom: 200px">
        <div v-for="book in imported_books" :key="book.srcUrl" class="book" :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`">
            <div>
                <div class="book_title_small">{{ book.name.medium }}</div>
            </div>
            <div class="booktext--right">
                <img v-if="Capacitor.getPlatform() !== 'web'" class="ionicon ionicon-custom" src="/assets/wifi.svg" />
                <button @click="removeImportedBook(book)">
                    <img class="ionicon ionicon-custom" src="/assets/close.svg" />
                </button>
            </div>
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
@import "/css/settings.css";
@import "/css/book.css";
</style>

<style scoped>
.ionicon-custom {
    filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%);
}

.book {
    max-height: 50px;
}
</style>
