<script setup lang="ts">
//import SplashScreen from "@/components/SplashScreen.vue";
import { RouterView } from "vue-router";
//import { useLocalStorage } from "@vueuse/core";

//let landing_complete = useLocalStorage<boolean>("update3showcase", false);
</script>

<template>
    <!-- <SplashScreen v-if="!landing_complete" /> -->
    <RouterView/>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
body::-webkit-scrollbar {
    display: none;
}

body {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}
</style>
