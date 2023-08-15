import { Preferences } from "@capacitor/preferences";
import { useStorageAsync } from "@vueuse/core";
import type { UseStorageAsyncOptions, StorageLikeAsync } from "@vueuse/core";
import type { MaybeRefOrGetter, Ref } from "vue";

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

export function useCapacitorPreferences(key: string, initialValue: MaybeRefOrGetter<string>, options?: UseStorageAsyncOptions<string>): RemovableRef<string>;
export function useCapacitorPreferences(key: string, initialValue: MaybeRefOrGetter<boolean>, options?: UseStorageAsyncOptions<boolean>): RemovableRef<boolean>;
export function useCapacitorPreferences(key: string, initialValue: MaybeRefOrGetter<number>, options?: UseStorageAsyncOptions<number>): RemovableRef<number>;
export function useCapacitorPreferences<T>(key: string, initialValue: MaybeRefOrGetter<T>, options?: UseStorageAsyncOptions<T>): RemovableRef<T>;
export function useCapacitorPreferences<T = unknown>(key: string, initialValue: MaybeRefOrGetter<null>, options?: UseStorageAsyncOptions<T>): RemovableRef<T>;

/**
 * Reactive Capacitor Preferences.
 * This code is adapted from here: https://vueuse.org/core/useStorageAsync/
 */
export function useCapacitorPreferences<T extends string | number | boolean | object | null>(key: string, initialValue: MaybeRefOrGetter<T>, options: UseStorageAsyncOptions<T> = {}): Ref<any | null> {
    return useStorageAsync(key, initialValue, preferences_wrapper, options);
}
