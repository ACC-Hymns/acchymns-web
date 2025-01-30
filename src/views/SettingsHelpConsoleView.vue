<script setup lang="ts">
import NavigationBar from "@/components/NavigationBar.vue";
import { useNavigator } from "@/router/navigator";
const { back } = useNavigator();
import { useConsoleStore } from "@/stores/console";

const console_store = useConsoleStore();
</script>

<template>
    <div class="menu">
        <div class="title">
            <img
                @click="back()"
                class="ionicon title--left"
                src="/assets/chevron-back-outline.svg"
            />
            <h1 class="title--center">Application Logs</h1>
        </div>
    </div>

    <div class="main-content settings">
        <div
            class="internal-console"
            v-html="console_store.logs.replaceAll('\n', '<br>')"
        ></div>
    </div>

    <NavigationBar current_page="settings" />
</template>

<style scoped>
@import "@/assets/css/settings.css";
@import "@/assets/css/about-app.css";

.settings {
    height: calc(100vh - 65px - 61.16px - 40px);
}

.internal-console {
    height: 100%;
    border-radius: 15px;
    padding: 25px;
    margin: 20px;
    color: var(--color);
    background: var(--background);
    overflow: auto;
}
</style>

<style>
p {
    margin: 0px;
}
</style>
