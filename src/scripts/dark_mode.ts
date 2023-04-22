import { useLocalStorage, useMediaQuery } from "@vueuse/core";
import { computed, readonly, watch } from "vue";

const system_prefers_dark_mode = useMediaQuery("(prefers-color-scheme: dark)");
const override_system_theme = readonly(useLocalStorage("overrideSystemTheme", false));
const user_prefers_dark_mode = readonly(useLocalStorage("overrideDarkMode", false));

const dark_mode = computed(() => {
    if (override_system_theme.value) {
        return user_prefers_dark_mode.value;
    } else {
        return system_prefers_dark_mode.value;
    }
});

watch(
    dark_mode,
    () => {
        // This sets the root node's theme
        if (dark_mode.value) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    },
    { immediate: true }
);
