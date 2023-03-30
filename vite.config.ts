import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            input: [
                fileURLToPath(new URL("./search.html", import.meta.url)),
                fileURLToPath(new URL("./search.html", import.meta.url)),
                fileURLToPath(new URL("./bookmarks.html", import.meta.url)),
                fileURLToPath(new URL("./selection.html", import.meta.url)),
                fileURLToPath(new URL("./settings.html", import.meta.url)),
                fileURLToPath(new URL("./index.html", import.meta.url)),
                fileURLToPath(new URL("./settings/info/about-app.html", import.meta.url)),
                fileURLToPath(new URL("./settings/info/attributions.html", import.meta.url)),
                fileURLToPath(new URL("./settings/info/changelog.html", import.meta.url)),
                fileURLToPath(new URL("./settings/info/help.html", import.meta.url)),
                fileURLToPath(new URL("./settings/preferences/options/options.html", import.meta.url)),
                fileURLToPath(new URL("./settings/preferences/import_songs/import_songs.html", import.meta.url)),
                // settings: fileURLToPath(new URL('./settings.html', import.meta.url))
            ],
        },
    },
});
