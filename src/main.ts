import { createApp } from "vue";
// import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "@/assets/css/globals.css";
import "@/assets/css/fonts.css";

import "@/scripts/dark_mode";

const app = createApp(App);

// app.use(createPinia());
app.use(router);

app.mount("#app");
