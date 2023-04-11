<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

let landing_complete = useLocalStorage<boolean>("landing_complete", false);
</script>

<template>
    <div v-if="!landing_complete" class="fill" style="position: fixed">
        <div class="welcomepage">
            <div class="changeslistings">
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
        <div class="startbuttoncontainer">
            <button class="startbutton" @click="landing_complete = true">
                <span style="color: white">Continue</span>
            </button>
        </div>
    </div>
</template>
