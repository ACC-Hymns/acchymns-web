import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { BookSummary } from "@/scripts/types";

export const useCounterStore = defineStore("counter", () => {
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);
    function increment() {
        count.value++;
    }

    return { count, doubleCount, increment };
});

export const useBookMetadataStore = defineStore("book_metadata", () => {
    const last_fetched_time = ref(new Date());
    const cached = ref(0);
    const doubleCount = computed(() => count.value * 2);
    function increment() {
        count.value++;
    }

    return { last_fetched_time, doubleCount, increment };
});
