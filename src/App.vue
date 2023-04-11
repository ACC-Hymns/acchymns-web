<script setup lang="ts">
import SplashScreen from "@/components/SplashScreen.vue";
import { RouterView } from "vue-router";
import { useLocalStorage } from "@vueuse/core";

let landing_complete = useLocalStorage<boolean>("landing_complete", false);
</script>

<template>
    <SplashScreen v-if="!landing_complete" />
    <RouterView v-else />
</template>
