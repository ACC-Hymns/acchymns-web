<script setup lang="ts">
import { useBookSummary } from "@/composables/book_metadata";
import { getBookDataSummary } from "@/scripts/book_import";
import { type BookDataSummary } from "@/scripts/types";
import { Capacitor } from "@capacitor/core";
import { onMounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        src: string;
        withLink?: boolean;
    }>(),
    {
        withLink: true,
    },
);

const {
    summary: book,
    isFinished,
    isSlowFetch,
} = useBookSummary(props.src, {
    timeout: 10000,
    slowFetchThreshold: 200,
});

const book_data_summary = ref<BookDataSummary>();

onMounted(async () => {
    book_data_summary.value = await getBookDataSummary(book.value);
});
</script>
<template>
    <!-- Book has been successfully loaded -->
    <template v-if="isFinished && book != null">
        <component
            :is="withLink ? 'RouterLink' : 'div'"
            :to="`selection/${book.name.short}`"
            class="book"
            :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`"
        >
            <div class="book_title">{{ book.name.medium }}</div>
            <!-- Allow a consumer to insert whatever they'd like -->
            <slot></slot>
            <!-- Only show wifi symbol if it's a wifi only book and we're on mobile
            <img
                v-if="book_data_summary?.status == BookSourceType.IMPORTED && router.currentRoute.value.path != '/settings/import' && Capacitor.getPlatform() !== 'web'"
                class="ionicon booktext--right"
                style="filter: invert(100%)"
                src="/assets/wifi.svg"
            /> -->
        </component>
    </template>
    <template v-else-if="!isFinished && isSlowFetch">
        <div
            class="book"
            :style="`background: linear-gradient(135deg, #a3a298, #4d4c47)`"
        >
            <div class="book_title">Loading...</div>
            <!-- Allow a consumer to insert whatever they'd like -->
            <slot></slot>
            <!-- It's okay to show a wifi symbol if it's fetching
            <img class="ionicon booktext--right" style="filter: invert(100%)" src="/assets/wifi.svg" /> -->
        </div>
    </template>
    <template v-else-if="isFinished">
        <div
            class="book"
            :style="`background: linear-gradient(135deg, #000000, #000000)`"
        >
            <div class="book_title">Unavailable</div>
            <!-- Allow a consumer to insert whatever they'd like -->
            <slot></slot>
            <!-- Maybe show a disconnected wifi symbol? -->
            <!-- <img class="ionicon booktext--right" style="filter: invert(100%)" src="/assets/wifi.svg" /> -->
        </div>
    </template>
</template>

<style>
@import "@/assets/css/book.css";
</style>
