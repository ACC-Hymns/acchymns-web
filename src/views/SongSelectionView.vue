<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getAllBookMetaData, getSongMetaData, handle_missing_book } from "@/scripts/book_import";
import { useRouter } from "vue-router";
import DropdownMenu from "@/components/DropdownMenu.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import { vOnClickOutside } from "@vueuse/components";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

const error_active = ref(false);

let book_name = ref("");
let index_available = ref(false);
let button_color = ref("#000000");

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const songs = await getSongMetaData(props.book);

    if (songs == null) {
        await handle_missing_book(props.book);

        error_active.value = true;
        return;
    }

    book_name.value = BOOK_METADATA[props.book].name.medium;
    button_color.value = BOOK_METADATA[props.book].primaryColor;
    index_available.value = BOOK_METADATA[props.book].indexAvailable;
});

const dropdown_open = ref<boolean>(false);
let time_dropdown_closed = 0;

function open_dropdown() {
    const now = Date.now();
    let diff = now - time_dropdown_closed;
    if (diff <= 1) return;
    dropdown_open.value = true;
}
function reset_dropdown() {
    if (!dropdown_open.value) return;
    time_dropdown_closed = Date.now();

    dropdown_open.value = false;
}

import { Share } from "@capacitor/share";

async function shareSong() {
    await Share.share({
        // title: `${title.value}`,
        // text: `#${props.number} from ${book_summary.value?.name.medium} available online now!`,
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
                <img class="ionicon" @click="open_dropdown()" src="/assets/ellipsis-horizontal-circle-outline.svg" />
                <DropdownMenu class="dropdown-menu" :dropdown_open="dropdown_open" v-on-click-outside="reset_dropdown">
                    <div
                        @click="
                            router.replace(`/selection/${props.book}`);
                            reset_dropdown();
                        "
                    >
                        <div>Numerical</div>
                        <img class="ionicon" src="/assets/book-outline.svg" />
                    </div>
                    <div
                        @click="
                            router.replace(`/selection/${props.book}/topical`);
                            reset_dropdown();
                        "
                    >
                        <div>Topical</div>
                        <img class="ionicon" src="/assets/book-outline.svg" />
                    </div>
                    <div
                        @click="
                            router.replace(`/selection/${props.book}/alphabetical`);
                            reset_dropdown();
                        "
                    >
                        <div>Alphabetical</div>
                        <img class="ionicon" src="/assets/text.svg" />
                    </div>
                    <div
                        v-if="can_share"
                        @click="
                            shareSong();
                            reset_dropdown();
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
