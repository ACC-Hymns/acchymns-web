// import { computed } from "vue";
// import { defineStore } from "pinia";
// import { useLocalStorage, useMediaQuery } from "@vueuse/core";

// export const usePreferencesStore = defineStore("Preferences", () => {
//     const staggered_notes = useLocalStorage("staggered", true);
//     const playback_interval = useLocalStorage("playbackInterval", 0.25);
//     const playback_duration = useLocalStorage("playbackDuration", 3);
//     const panzoom_enabled = useLocalStorage("panzoomEnable", true);

//     const system_prefers_dark_mode = useMediaQuery("(prefers-color-scheme: dark)");
//     const override_system_theme = useLocalStorage("overrideSystemTheme", false);
//     const user_prefers_dark_mode = useLocalStorage("overrideDarkMode", false);

//     const prefers_dark_mode = computed(() => (override_system_theme.value ? user_prefers_dark_mode.value : system_prefers_dark_mode.value));
//     const song_inverted = useLocalStorage("songInverted", false);
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

export {};
