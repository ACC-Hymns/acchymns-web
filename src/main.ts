import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { defineCustomElements } from "@ionic/pwa-elements/loader";

// Preload page-wide CSS and setup dark mode
import "@/assets/css/globals.css";
import "@/assets/css/fonts.css";
import "@/scripts/dark_mode";

const app = createApp(App);

app.use(createPinia());
app.use(router);

import { registerConsoleStore } from "@/stores/console";
registerConsoleStore();
defineCustomElements(window);

app.mount("#app");

import { migrate } from "@/scripts/migrate";
migrate();
