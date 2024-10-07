import { createApp } from "vue";
import { createPinia } from "pinia";
import { App, URLOpenListenerEvent } from '@capacitor/app';

import VueApp from "./App.vue";
import router from "./router";

import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { setBackForwardNavigationGestures } from "capacitor-plugin-ios-webview-configurator";

// Preload page-wide CSS and setup dark mode
import "@/assets/css/globals.css";
import "@/assets/css/fonts.css";
import "@/scripts/dark_mode";

const app = createApp(VueApp);

app.use(createPinia());
app.use(router);

App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
    // Example url: https://acchymns.app/HSZ/2
    // slug = /tabs/tabs2
    const slug = event.url.split('.app').pop();
  
    // We only push to the route if there is a slug present
    if (slug) {
        router.push({
            path: slug,
        });
    }
});

// set webview settings
setBackForwardNavigationGestures(true);

import { registerConsoleStore } from "@/stores/console";
registerConsoleStore();
defineCustomElements(window);

import { loadBookSources } from "./scripts/book_import";
import { migrate } from "@/scripts/migrate";
async function load() {
    await loadBookSources();
    await migrate();
    
    app.mount("#app");
}
load();
