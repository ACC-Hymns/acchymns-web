<script setup lang="ts">
import { useBookSummary } from "@/composables/book_metadata";
import { useRoute } from "vue-router";
import { Capacitor } from "@capacitor/core";

const props = withDefaults(
    defineProps<{
        src: string;
        withLink?: boolean;
    }>(),
    {
        withLink: true,
    }
);

const current_route = useRoute();

const {
    summary: book,
    isFinished,
    isSlowFetch,
} = useBookSummary(props.src, {
    timeout: 10000,
    slowFetchThreshold: 200,
});
</script>

<template>
    <!-- Book has been successfully loaded -->
    <template v-if="isFinished && book != null">
        <component :is="withLink ? 'RouterLink' : 'div'" :to="`selection/${book.name.short}`" class="book" :style="`background: linear-gradient(135deg, ${book.primaryColor}, ${book.secondaryColor})`">
            <div class="book_title">{{ book.name.medium }}</div>
            <!-- Allow a consumer to insert whatever they'd like -->
            <slot></slot>
            <!-- Only show wifi symbol if it's a wifi only book and we're on mobile -->
            <img
                v-if="book.addOn && current_route.path != '/settings/import' && Capacitor.getPlatform() !== 'web'"
                class="ionicon booktext--right"
                style="filter: invert(100%)"
                src="/assets/wifi.svg"
            />
        </component>
    </template>
    <template v-else-if="!isFinished && isSlowFetch">
        <div class="book" :style="`background: linear-gradient(135deg, #a3a298, #4d4c47)`">
            <div class="book_title">Loading...</div>
            <!-- Allow a consumer to insert whatever they'd like -->
            <slot></slot>
            <!-- It's okay to show a wifi symbol if it's fetching -->
            <img class="ionicon booktext--right" style="filter: invert(100%)" src="/assets/wifi.svg" />
        </div>
    </template>
    <template v-else-if="isFinished">
        <div class="book" :style="`background: linear-gradient(135deg, #000000, #000000)`">
            <div class="book_title">Unknown</div>
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
