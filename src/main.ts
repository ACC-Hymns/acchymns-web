import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Preload page-wide CSS and setup dark mode
import "@/assets/css/globals.css";
import "@/assets/css/fonts.css";
import "@/scripts/dark_mode";

import { defineCustomElements } from "@ionic/pwa-elements/loader";
defineCustomElements(window);

const app = createApp(App);

app.use(createPinia());
app.use(router);

import { registerConsoleStore } from "@/stores/console";
registerConsoleStore();

import { loadBookSources } from "./scripts/book_import";
import { migrate } from "@/scripts/migrate";
async function load() {
    await loadBookSources();
    await migrate();

    app.mount("#app");
}
load();
