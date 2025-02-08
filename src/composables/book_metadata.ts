import { useCachedJSONFetch, type UseCachedFetchOptions } from "@/composables/cached_fetch";
import { getAllBookMetaData, getSongMetaData, handle_missing_book } from "@/scripts/book_import";
import { prepackaged_books } from "@/scripts/constants";
import type { BookSummary, SongList } from "@/scripts/types";
import { computed, ref } from "vue";

export function useBookSummary(url: string, options: UseCachedFetchOptions) {
    const { result, isCached, isFetching, isFinished, isSlowFetch } = useCachedJSONFetch<BookSummary>(`${url}/summary.json`, options);
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

export function useAllBookSummaries() {
    const result = ref<{ [k: string]: BookSummary }>({});
    const is_ready = ref(false);

    async function execute() {
        result.value = await getAllBookMetaData();
        is_ready.value = true;
    }
    execute();

    return { result, is_ready };
}

export function useBookSongMetaData(book_id: string) {
    const result = ref<SongList>({});

    async function execute() {
        const temp = await getSongMetaData(book_id);
        if (temp == null) {
            console.log("book doesn't exist");
            await handle_missing_book(book_id);
        }
        result.value = temp ?? {};
    }
    execute();

    return { result };
}
