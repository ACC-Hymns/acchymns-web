<script setup lang="ts">
import NavigationBar from "@/components/NavigationBar.vue";
import { useNavigator } from "@/router/navigator";
import package_json from "@/../package.json";

const { dependencies } = package_json;

function clean_version(version: string) {
    return version.replace(/^[^0-9]+/, "");
}

const { back } = useNavigator();
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <div class="title--center">
                <h1>Attributions</h1>
            </div>
        </div>
    </div>

    <div class="settings main-content">
        <a href="https://tonejs.github.io" class="attribution">
            <h3 class="release">Tone.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.tone) }}</h5>
        </a>
        <a href="https://anvaka.github.io/panzoom/demo/attach-via-script.html" class="attribution">
            <h3 class="release">Avanka Panzoom</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.panzoom) }}</h5>
        </a>
        <a href="https://mozilla.github.io/pdf.js/" class="attribution">
            <h3 class="release">PDF.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["pdfjs-dist"]) }}</h5>
        </a>
        <a href="https://vuejs.org/" class="attribution">
            <h3 class="release">Vue.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.vue) }}</h5>
        </a>
        <a href="https://router.vuejs.org/" class="attribution">
            <h3 class="release">Vue Router</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["vue-router"]) }}</h5>
        </a>
        <a href="https://github.com/SortableJS/vue.draggable.next/" class="attribution">
            <h3 class="release">Vue Draggable</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.vuedraggable) }}</h5>
        </a>
        <a href="https://github.com/notoriousb1t/polymorph" class="attribution">
            <h3 class="release">Polymorph.js</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["polymorph-js"]) }}</h5>
        </a>
        <a href="https://github.com/marc136/node-folder-hash" class="attribution">
            <h3 class="release">Node Folder Hash</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["folder-hash"]) }}</h5>
        </a>
        <a href="https://pinia.vuejs.org/" class="attribution">
            <h3 class="release">Pinia</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies.pinia) }}</h5>
        </a>
        <a href="https://capacitorjs.com/" class="attribution">
            <h3 class="release">Capacitor</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["@capacitor/core"]) }}</h5>
        </a>
        <a href="https://github.com/ionic-team/pwa-elements" class="attribution">
            <h3 class="release">Ionic PWA Elements</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">{{ clean_version(dependencies["@ionic/pwa-elements"]) }}</h5>
        </a>
        <a href="https://ionic.io/ionicons" class="attribution">
            <h3 class="release">Ionicons</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">7.4.0</h5>
        </a>
        <a href="https://fonts.google.com/about" class="attribution">
            <h3 class="release">Google Fonts</h3>
            <h5 class="releaseDate" style="color: rgb(200, 200, 200)">4.0.0</h5>
        </a>
    </div>

    <NavigationBar current_page="settings" />
</template>

<style scoped>
@import "@/assets/css/settings.css";
@import "@/assets/css/about-app.css";
</style>
