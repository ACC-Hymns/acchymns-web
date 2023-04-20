<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

let landing_complete = useLocalStorage<boolean>("landing_complete", false);
</script>

<template>
    <div class="fill">
        <div class="welcome-page">
            <div class="change-listings">
                <h1 style="margin-top: 20%">What's new?</h1>
                <div class="grid-container">
                    <div class="grid-item">
                        <img class="grid-image" src="/assets/search.svg" />
                        <span class="changetext">Pinch-to-Zoom</span>
                    </div>
                    <div class="grid-item">
                        <img class="grid-image" src="/assets/musical-notes.svg" />
                        <span class="changetext">Starting Notes</span>
                    </div>
                    <div class="grid-item">
                        <img class="grid-image" src="/assets/book-outline.svg" />
                        <span class="changetext">More Song Books</span>
                    </div>
                    <div class="grid-item">
                        <img class="grid-image" src="/assets/bug-outline.svg" />
                        <span class="changetext">Bug Fixes</span>
                    </div>
                </div>
            </div>
        </div>
        <button class="start-button" @click="landing_complete = true">
            <span style="color: white">Continue</span>
        </button>
    </div>
</template>

<style scoped>
.change-listings {
    text-align: center;
}

.start-button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: auto;
    margin-right: auto;

    /* Styling */
    height: 50px;
    width: 80%;
    background-color: #2196F3;
    border-radius: 15px;

    /* Positioning for this element */
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10%;
}

.welcome-page {
    display: flex;
    justify-content: center;
    align-items: center;
}

.grid-container {
    display: grid;
    grid-template-columns: auto auto;
}

.grid-item {
    padding: 30px;
    font-size: 15px;
    text-align: center;
    border-color: #141414;
}

.changetext {
    display: block;
    white-space: normal;
    color: var(--color);
}

.grid-image {
    width: 80px;
    filter: var(--change-svg-filter);
}
</style>
