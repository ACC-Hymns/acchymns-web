// import { computed } from "vue";
// import { defineStore } from "pinia";
// import { useLocalStorage, useMediaQuery } from "@vueuse/core";

// export const usePreferencesStore = defineStore("Preferences", () => {
//     const staggered_notes = useLocalStorage("ACCOptions.staggered", true);
//     const playback_interval = useLocalStorage("ACCOptions.playbackInterval", 0.25);
//     const playback_duration = useLocalStorage("ACCOptions.playbackDuration", 3);

//     const system_prefers_dark_mode = useMediaQuery("(prefers-color-scheme: dark)");
//     const override_system_theme = useLocalStorage("ACCOptions.overrideSystemTheme", false);
//     const user_prefers_dark_mode = useLocalStorage("ACCOptions.overrideDarkMode", false);

//     const prefers_dark_mode = computed(() => (override_system_theme.value ? user_prefers_dark_mode.value : system_prefers_dark_mode.value));
//     const song_inverted = useLocalStorage("ACCOptions.songInverted", false);
//     const actually_invert = computed(() => prefers_dark_mode.value && song_inverted.value);

//     return {
//         staggered_notes,
//         playback_interval,
//         playback_duration,
//         panzoom_enabled,
//         system_prefers_dark_mode,
//         override_system_theme,
//         user_prefers_dark_mode,
//         prefers_dark_mode,
//         song_inverted,
//         actually_invert,
//     };
// });

const options_prefix = "ACCOptions.";

export function resetOptions() {
    for (const key in localStorage) {
        if (key.startsWith(options_prefix)) {
            localStorage.removeItem(key);
        }
    }
}
