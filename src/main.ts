import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import vue3GoogleLogin from 'vue3-google-login'

import { defineCustomElements } from "@ionic/pwa-elements/loader";

// Preload page-wide CSS and setup dark mode
import "@/assets/css/globals.css";
import "@/assets/css/fonts.css";
import "@/scripts/dark_mode";

const app = createApp(App);

app.use(vue3GoogleLogin, {
    clientId: '1040544016956-63brkira9rmr3jbo3m54du2mrkmhcjve.apps.googleusercontent.com'
})
app.use(createPinia());
app.use(router);

import { registerConsoleStore } from "@/stores/console";
registerConsoleStore();
defineCustomElements(window);

app.mount("#app");

import { migrate } from "@/scripts/migrate";
migrate();
