<script setup lang="ts">
import { type BookDataSummary } from "@/scripts/types";

withDefaults(
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
