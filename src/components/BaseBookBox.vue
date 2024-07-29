<script setup lang="ts">
import { useBookSummary } from "@/composables/book_metadata";
import { getBookDataSummary } from "@/scripts/book_import";
import router from "@/router";
import {
    BookSourceType,
    type BookDataSummary,
    type BookSummary,
} from "@/scripts/types";
import { Capacitor } from "@capacitor/core";
import { onMounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        summary: BookDataSummary;
        isEnabled?: boolean;
    }>(),
    {
        isEnabled: true,
    },
);
</script>
<template>
    <component
        :is="'div'"
        class="book"
        :style="`background: linear-gradient(135deg, ${summary.primaryColor}, ${
            summary.secondaryColor
        }); filter: brightness(${isEnabled ? 1.0 : 0.4});`"
    >
        <div class="book_title">{{ summary.name?.medium }}</div>
        <!-- Allow a consumer to insert whatever they'd like -->
        <slot></slot>
    </component>
</template>

<style>
@import "@/assets/css/book.css";
</style>
