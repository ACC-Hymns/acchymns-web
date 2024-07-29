import { Preferences } from "@capacitor/preferences";
import { useStorageAsync } from "@vueuse/core";
import type { UseStorageAsyncOptions, StorageLikeAsync } from "@vueuse/core";
import type { MaybeComputedRef, RemovableRef } from "@vueuse/shared";

const preferences_wrapper: StorageLikeAsync = {
    async getItem(key: string) {
        return (await Preferences.get({ key })).value;
    },
    async setItem(key: string, value: string) {
        await Preferences.set({ key, value });
    },
    async removeItem(key: string) {
        await Preferences.remove({ key });
    },
};

export function useCapacitorPreferences(
    key: string,
    initialValue: MaybeComputedRef<string>,
    options?: UseStorageAsyncOptions<string>,
): RemovableRef<string>;
export function useCapacitorPreferences(
    key: string,
    initialValue: MaybeComputedRef<boolean>,
    options?: UseStorageAsyncOptions<boolean>,
): RemovableRef<boolean>;
export function useCapacitorPreferences(
    key: string,
    initialValue: MaybeComputedRef<number>,
    options?: UseStorageAsyncOptions<number>,
): RemovableRef<number>;
export function useCapacitorPreferences<T>(
    key: string,
    initialValue: MaybeComputedRef<T>,
    options?: UseStorageAsyncOptions<T>,
): RemovableRef<T>;
export function useCapacitorPreferences<T = unknown>(
    key: string,
    initialValue: MaybeComputedRef<null>,
    options?: UseStorageAsyncOptions<T>,
): RemovableRef<T>;

/**
 * Reactive Capacitor Preferences.
 * This code is adapted from here: https://vueuse.org/core/useStorageAsync/
 */
export function useCapacitorPreferences<
    T extends string | number | boolean | object | null,
>(
    key: string,
    initialValue: MaybeComputedRef<T>,
    options: UseStorageAsyncOptions<T> = {},
): RemovableRef<any> {
    return useStorageAsync(key, initialValue, preferences_wrapper, options);
}
