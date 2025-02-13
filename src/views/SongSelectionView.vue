<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData, handle_missing_book } from "@/scripts/book_import";
import { useRouter } from "vue-router";
import DropdownMenu from "@/components/DropdownMenu.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import { vOnClickOutside } from "@vueuse/components";
import type { OnClickOutsideOptions } from "@vueuse/core";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

const error_active = ref(false);

const book_name = ref("");
const index_available = ref(false);

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songs = await getSongMetaData(props.book);

    if (songs == null) {
        await handle_missing_book(props.book);

        error_active.value = true;
        return;
    }

    book_name.value = BOOK_METADATA[props.book].name.medium;
    index_available.value = BOOK_METADATA[props.book].indexAvailable;
});

const dropdown_open = ref<boolean>(false);
const dropdown_button = ref<HTMLElement | null>(null);
const closeDropdown: [(_: any) => void, OnClickOutsideOptions] = [_ => (dropdown_open.value = false), { ignore: [dropdown_button] }];

import { Share } from "@capacitor/share";

async function shareSong() {
    await Share.share({
        title: `${book_name.value}`,
        text: `${book_name.value} available online now!`,
        url: `https://acchymns.app/selection/${props.book}`,
    });
}

const can_share = ref<boolean>(false);
Share.canShare().then(res => (can_share.value = res.value));
</script>

<template>
    <div class="menu">
        <div class="title">
            <div class="title--left">
                <img @click="router.back()" class="ionicon" src="/assets/chevron-back-outline.svg" />
            </div>
            <div class="title--center">
                <h1>{{ error_active ? "Unavailable" : book_name }}</h1>
            </div>
            <div class="title--right">
                <img
                    class="ionicon"
                    ref="dropdown_button"
                    @click="dropdown_open = !dropdown_open"
                    src="/assets/ellipsis-horizontal-circle-outline.svg"
                />
                <DropdownMenu class="dropdown-menu" :dropdown_open="dropdown_open" v-on-click-outside="closeDropdown">
                    <div
                        @click="
                            router.replace(`/selection/${props.book}`);
                            dropdown_open = false;
                        "
                    >
                        <div>Numerical</div>
                        <img class="ionicon" src="/assets/num.svg" />
                    </div>
                    <div
                        @click="
                            router.replace(`/selection/${props.book}/alphabetical`);
                            dropdown_open = false;
                        "
                    >
                        <div>Alphabetical</div>
                        <img class="ionicon" src="/assets/text.svg" />
                    </div>
                    <div
                        v-if="index_available"
                        @click="
                            router.replace(`/selection/${props.book}/topical`);
                            dropdown_open = false;
                        "
                    >
                        <div>Topical</div>
                        <img class="ionicon" src="/assets/book-outline.svg" />
                    </div>
                    <div
                        v-if="can_share"
                        @click="
                            shareSong();
                            dropdown_open = false;
                        "
                    >
                        <div>Share</div>
                        <img class="ionicon" src="/assets/share-outline.svg" />
                    </div>
                </DropdownMenu>
            </div>
        </div>
    </div>
    <div v-if="error_active" class="fallback-container">
        <img class="wifi-fallback" src="/assets/wifi_off.svg" />
    </div>
    <RouterView v-else class="main-content"></RouterView>

    <NavigationBar current_page="home" />
</template>

<style scoped>
.wifi-fallback {
    filter: var(--svg-back-filter);
    display: block;
    width: 50%;
    z-index: -1;
}

.fallback-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.dropdown-menu {
    top: calc(40px + env(safe-area-inset-top));
    right: 15px;
}
</style>
