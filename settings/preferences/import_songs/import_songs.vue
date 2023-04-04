<script setup lang="ts">
import { fetchJSONWithTimeout } from "../../../js/book_import.js";
import type { BookSummary } from "../../../js/types";
import { unknown } from "../../../js/types";
import { watch, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

const branch = "dallas/try-pdf";

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

function fetchBookSummary(url: string) {
    return fetchJSONWithTimeout(`${url}/summary.json`, { timeout: 500 })
        .then((book: BookSummary) => {
            book.srcUrl = url;
            return book;
        })
        .catch(() => {
            let temp = unknown;
            temp.srcUrl = url;
            return temp;
        });
}

let imported_book_urls = useLocalStorage<string[]>("externalBooks", []); // Not watching deeply, must assign new array

const url_input = ref("");
const reference_input = ref("");

// Imported books & updating
let imported_books = ref<BookSummary[]>([]);
watch(
    imported_book_urls,
    async (urls) => {
        imported_books.value = await Promise.all(urls.map(fetchBookSummary));
    },
    { immediate: true }
);

// Preview books & updating
let preview_books = ref<BookSummary[]>([]);
watch(
    imported_book_urls,
    async (urls) => {
        let preview_urls = Object.values(public_references).filter((url) => !urls.includes(url));
        preview_books.value = await Promise.all(preview_urls.map(fetchBookSummary));
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
        addImportedURL(known_references[short_book_name]);
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
    imported_book_urls.value = imported_book_urls.value.filter((url) => url != to_remove);
}

function removeImportedBookByCode(short_book_name: string) {
    if (short_book_name in known_references) {
        removeImportedURL(known_references[short_book_name]);
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
        <a href="/settings.html"><img class="ionicon" src="/assets/chevron-back-outline.svg" /></a>
        <h1>Import Books</h1>
        <span class="space"></span>
    </div>
    <div style="display: flex; justify-content: center">
        <h5 style="margin: 0 auto">The song books below require an internet connection</h5>
    </div>
    <div class="settings">
        <div class="input-option">
            <span>Reference</span>
            <input v-model="reference_input" type="text" />
            <button @click="addImportedBookByCode(reference_input)">
                <img class="ionicon ionicon-custom" src="/assets/chevron-forward-outline.svg" />
            </button>
        </div>
        <div class="input-option">
            <span>URL</span>
            <input v-model="url_input" type="url" />
            <button @click="addImportedURL(url_input)">
                <img class="ionicon ionicon-custom" src="/assets/chevron-forward-outline.svg" />
            </button>
        </div>
    </div>

    <!-- Publicly available, but not imported books -->
    <h2 v-if="preview_books.length != 0">Available Books</h2>
    <TransitionGroup name="book-list" tag="div" class="ease-height">
        <div
            v-for="book in preview_books"
            :key="book.name.short"
            class="book"
            :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`"
        >
            <div>
                <div class="book_title_small">{{ book.name.medium }}</div>
            </div>
            <div class="booktext--right">
                <button @click="addImportedBook(book)">
                    <img class="ionicon ionicon-custom" src="/assets/add-circle-outline.svg" />
                </button>
            </div>
        </div>
    </TransitionGroup>

    <!-- Imported Books -->
    <h2 v-if="imported_books.length != 0">Imported Books</h2>
    <TransitionGroup name="book-list" tag="div" class="ease-height" style="padding-bottom: 200px">
        <div
            v-for="book in imported_books"
            :key="book.name.short"
            class="book"
            :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`"
        >
            <div>
                <div class="book_title_small">{{ book.name.medium }}</div>
            </div>
            <div class="booktext--right">
                <img class="ionicon ionicon-custom" src="/assets/wifi.svg" />
                <button @click="removeImportedBook(book)">
                    <img class="ionicon ionicon-custom" src="/assets/close.svg" />
                </button>
            </div>
        </div>
    </TransitionGroup>

    <nav class="nav">
        <a href="/index.html" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/home-outline.svg" />
            <span class="nav__text">Home</span>
        </a>
        <a href="/search.html" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </a>
        <a href="/bookmarks.html" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
            <span class="nav__text">Bookmarks</span>
        </a>
        <a href="/settings.html" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/settings.svg" />
            <span class="nav__text">Settings</span>
        </a>
    </nav>
</template>

<style>
@import "/css/settings.css";
@import "/css/book.css";
@import "/css/globals.css";
@import "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>

<style scoped>
.ionicon-custom {
    filter: invert(100%) sepia(9%) saturate(7497%) hue-rotate(180deg) brightness(103%) contrast(93%);
}

.book {
    max-height: 50px;
    /* width: max-content; */
    backface-visibility: hidden;
    z-index: 1;
}

.book-list-move {
    transition: all 1s ease;
}
.book-list-enter-active,
.book-list-leave-active {
    transition: all 2s ease;
}

.book-list-enter-from,
.book-list-leave-to {
    opacity: 0;
}

.ease-height {
    transition-property: height;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.book-list-leave-active {
    position: absolute;
}
</style>
