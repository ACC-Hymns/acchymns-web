<script setup lang="ts">
import { fetchBookSummary } from "@/scripts/book_import";
import type { BookSummary } from "@/scripts/types";
import { Capacitor } from "@capacitor/core";
import { ref, onMounted } from "vue";

const props = defineProps<{
    src: string;
}>();

const UnknownBookSummary: BookSummary = {
    name: {
        short: "UK",
        medium: "Unknown",
        long: "Unknown",
    },
    primaryColor: "#000000",
    secondaryColor: "#000000",
    fileExtension: "",
    numOfSongs: 0,
};
let book = ref<BookSummary>(UnknownBookSummary);

onMounted(async () => {
    const book_summary = await fetchBookSummary(props.src);
    if (book_summary != null) {
        book.value = book_summary;
    }
});
</script>

<template>
    <RouterLink :to="`selection/${book.name.short}`" class="book" :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`">
        <div class="book_title">{{ book.name.medium }}</div>
        <!-- Only show wifi symbol if it's a wifi only book and we're on mobile -->
        <img v-if="book.addOn && Capacitor.getPlatform() !== 'web'" class="ionicon booktext--right" style="filter: invert(100%)" src="/assets/wifi.svg" />
    </RouterLink>
</template>

<style>
@import "@/assets/css/book.css";
</style>
