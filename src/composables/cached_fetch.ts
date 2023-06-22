import { isRef, ref, watch, type Ref } from "vue";

export type UseCachedFetchOptions = RequestInit & {
    timeout?: number;
    slowFetchThreshold?: number;
    bestAttempt?: boolean;
    cacheLife?: number; // How long to retain the cache in milliseconds
};

export type CachedResource<T> = {
    time: number; // Received from Date.now()
    data: T;
};

const cache_prefix = "useCachedJSONFetch.";

export function clearCache() {
    for (const key in localStorage) {
        if (key.startsWith(cache_prefix)) {
            localStorage.removeItem(key);
        }
    }
}

export function useCache<T>(url: RequestInfo | URL) {
    return {
        retrieve: () => {
            const retrieved = localStorage.getItem(cache_prefix + url);
            if (retrieved == null) {
                return null;
            }
            return JSON.parse(retrieved) as CachedResource<T>;
        },
        save: (data: T) => {
            const fetched: CachedResource<T> = {
                time: Date.now(),
                data,
            };
            localStorage.setItem(cache_prefix + url, JSON.stringify(fetched));
        },
    };
}

export async function fetchCachedJSON<T>(url: RequestInfo | URL, options: UseCachedFetchOptions): Promise<T | null> {
    const cache = useCache<T>(url);
    const cached = cache.retrieve();
    const { cacheLife = 1000 * 60 * 60 } = options; // An hour in milliseconds is the default
    if (cached !== null && Date.now() - cached.time < cacheLife) {
        // Data is up to date, and can be utilized
        return cached.data;
    }

    try {
        if (options.timeout == undefined) {
            const resp = await fetch(url, { ...options });
            const json: T = await resp.json();
            cache.save(json);
            return json;
        } else {
            // Set up an abort controller to abort the request if desired
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), options.timeout);
            const resp = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(id);
            const json: T = await resp.json();
            cache.save(json);
            return json;
        }
    } catch (ex: any) {
        // Any extra errors should get propagated, aborts we can ignore
        const e = ex as DOMException;
        // Early exit on weird Apple "TypeError: Load Failed" <- Only Dallas has experienced this so far
        if (e.name == "TypeError") {
            console.error("Failed to fetch, IOS?:", e);
            return null;
        }
        if (e.name != "AbortError") {
            console.error(e);
            throw e;
        }

        // If we want to fail soft, bestAttempt should be set, and it will return the last cached value
        const { bestAttempt = false } = options;
        if (bestAttempt && cached != null) {
            // Cached values are out of date, but can still be used when the network fails
            return cached.data;
        }
    }
    return null;
}

export function useCachedJSONFetch<T>(url: RequestInfo | URL, options: UseCachedFetchOptions) {
    const result: Ref<T | null> = ref(null);
    const isFetching = ref<boolean>(false);
    const isSlowFetch = ref<boolean>(false);
    const isFinished = ref<boolean>(false);
    const isCached = ref<boolean>(false);

    const cache = useCache<T>(url);

    async function execute() {
        // Set starting lifecycle reporting
        result.value = null;
        isFetching.value = false;
        isSlowFetch.value = false;
        isFinished.value = false;
        isCached.value = false;

        const cached = cache.retrieve();
        const { cacheLife = 1000 * 60 * 60 } = options; // An hour in milliseconds is the default
        if (cached !== null && Date.now() - cached.time < cacheLife) {
            // Data is up to date, and can be utilized
            result.value = cached.data;
            isFinished.value = true;
            isCached.value = true;
            return;
        }

        isFetching.value = true;
        try {
            if (options.timeout == undefined) {
                // When no timeout is set, a slow fetch is 5 seconds
                const slow_fetch_id = setTimeout(() => (isSlowFetch.value = true), 5000);
                const resp = await fetch(url, { ...options });
                isFetching.value = false;
                clearTimeout(slow_fetch_id);
                const json: T = await resp.json();
                result.value = json;
            } else {
                // When no timeout is set, a slow fetch is 20% of the timeout duration, or past the threshold if used
                const slow_fetch_id = setTimeout(() => (isSlowFetch.value = true), options.slowFetchThreshold ?? 0.2 * options.timeout);

                // Set up an abort controller to abort the request if desired
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), options.timeout);
                const resp = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });
                clearTimeout(id);
                clearTimeout(slow_fetch_id);
                isFetching.value = false;
                const json: T = await resp.json();
                result.value = json;
            }

            // Cache the result
            cache.save(result.value);
        } catch (ex: any) {
            result.value = null;
            isFetching.value = false;
            isSlowFetch.value = false;

            // Any extra errors should get propagated, aborts we can ignore
            const e = ex as DOMException;
            // Early exit on weird Apple "TypeError: Load Failed" <- Only Dallas has experienced this so far
            if (e.name == "TypeError") {
                console.error("Failed to fetch, IOS?:", e);
                return null;
            }

            if (e.name != "AbortError") {
                console.log(e);
                throw e;
            }

            // If we want to fail soft, bestAttempt should be set, and it will return the last cached value
            const { bestAttempt = false } = options;
            if (bestAttempt && cached != null) {
                // Cached values are out of date, but can still be used when the network fails
                result.value = cached.data;
                isCached.value = true;
            }
        }
        isFinished.value = true;
    }

    execute();

    if (isRef(url)) {
        watch(url, () => execute());
    }

    return { result, isFetching, isSlowFetch, isFinished, isCached };
}
