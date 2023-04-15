import { createApp } from "vue";
import { SafeAreaController, SafeArea } from '@aashu-dubey/capacitor-statusbar-safe-area';
// import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// app.use(createPinia());
app.use(router);

app.mount("#app");
SafeAreaController.injectCSSVariables();