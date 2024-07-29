import {
    useCachedJSONFetch,
    type UseCachedFetchOptions,
} from "@/composables/cached_fetch";
import { prepackaged_books } from "@/scripts/constants";
import type { BookSummary } from "@/scripts/types";
import { computed } from "vue";

export function useBookSummary(url: string, options: UseCachedFetchOptions) {
    const { result, isCached, isFetching, isFinished, isSlowFetch } =
        useCachedJSONFetch<BookSummary>(`${url}/summary.json`, options);
    const summary = computed(() => {
        const res = result.value;
        if (res == null) {
            return null;
        }
        res.addOn = !prepackaged_books.includes(res.name.short);
        res.srcUrl = url;
        return res;
    });
    return { summary, isCached, isFetching, isFinished, isSlowFetch };
}
