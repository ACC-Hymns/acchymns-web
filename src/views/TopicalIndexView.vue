<script setup lang="ts">
import { onMounted, onUpdated, ref, computed } from "vue";
import { getAllBookMetaData, getSongMetaData, getBookIndex } from "@/scripts/book_import";
import { RouterLink, useRouter } from "vue-router";
import type { Song } from "@/scripts/types";

const props = defineProps<{
    book: string;
}>();
const router = useRouter();

const swiping_enabled = ref(true);
const scroll_topic_list = ref<Element | null>(null);
let num_of_songs = ref(0);
let book_ref = ref("");
let primary_color = ref("#FFFFFF");
let secondary_color = ref("#000000");
let topical_index = ref<{ [topic: string]: Song[] }>({});
let rendered_topics = ref<Element[]>([]);
let active_topic = ref<string>("");
const songs_to_display = computed(() => {
    if (active_topic.value in topical_index.value) {
        return topical_index.value[active_topic.value];
    }
    return [];
});

onMounted(async () => {
    const BOOK_METADATA = await getAllBookMetaData();
    const BOOK_SONG_METADATA = await getSongMetaData(props.book);
    num_of_songs.value = BOOK_METADATA[props.book].numOfSongs;
    book_ref.value = BOOK_METADATA[props.book].name.short;
    primary_color.value = BOOK_METADATA[props.book].primaryColor;
    secondary_color.value = BOOK_METADATA[props.book].secondaryColor;
    const raw_index = (await getBookIndex(BOOK_METADATA[props.book].name.short)) ?? {};
    for (let [topic_name, numbers] of Object.entries(raw_index)) {
        topical_index.value[topic_name] = [];
        for (let song_number of numbers) {
            topical_index.value[topic_name].push({
                number: song_number,
                title: BOOK_SONG_METADATA[song_number].title,
                notes: BOOK_SONG_METADATA[song_number].notes,
            });
        }
        topical_index.value[topic_name].sort((a, b) => a.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "").localeCompare(b.title.replace(/[.,/#!$%^&*;:{}=\-_'"`~()]/g, "")));
    }
    console.log(scroll_topic_list.value?.scrollTop);
});

function disableSwipingAndShowTopicList(topic: string) {
    if (swiping_enabled.value) {
        swiping_enabled.value = false;
    } else {
        enableSwipingAndHideTopicList(topic);
    }
}

function enableSwipingAndHideTopicList(topic: string) {
    const desired_topic_element = rendered_topics.value.find(t => t.children[0].innerHTML === topic);
    console.log("desired_topic_element:", desired_topic_element);
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
    desired_topic_element?.children[0]?.scrollIntoView({ block: "start", inline: "start" });
    swiping_enabled.value = true;
}

const observer = new IntersectionObserver(
    (entries, _observer) => {
        if (swiping_enabled.value) {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    console.log(entry.target.childNodes[0].textContent);
                    active_topic.value = entry.target.childNodes[0].textContent as string;
                }
            }
        }
    },
    {
        root: null,
        rootMargin: "0px",
        threshold: 0.8,
    }
);

onUpdated(async () => {
    for (const element of rendered_topics.value) {
        observer.observe(element);
    }
});
</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="router.back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">Topical Index</h1>
        </div>
    </div>

    <div class="main-content">
        <!-- Each Topical Section -->
        <div>
            <div class="topic-list" ref="scroll_topic_list">
                <div
                    v-for="(_topic_songs, topic) in topical_index"
                    ref="rendered_topics"
                    :key="topic"
                    class="topic"
                    :style="{ background: primary_color }"
                    @click="disableSwipingAndShowTopicList(topic as string)"
                >
                    <h3 class="topic-title">{{ topic }}</h3>
                </div>
            </div>
            <RouterLink v-show="swiping_enabled"
                v-for="song in songs_to_display"
                :key="song.title + song.number"
                :to="`/display/${book_ref}/${song.number}`"
                class="song"
                :style="`background: linear-gradient(135deg, ${primary_color}, ${secondary_color})`"
            >
                <div>
                    <div class="song__title">{{ song.title }}</div>
                </div>
                <div class="booktext--right">
                    <div class="song__number">#{{ song.number }}</div>
                </div>
            </RouterLink>
        </div>
        <div v-show="!swiping_enabled">
            <!-- <div class="topic" :style="{ background: primary_color }" @click="enableSwipingAndHideTopicList(active_topic)">
                <h3 class="topic-title">{{ active_topic }}</h3>
            </div> -->
            <template v-for="(_topic_songs, topic) in topical_index" :key="topic">
                <div v-if="topic != active_topic" class="topic expanded-topic" :style="{ background: primary_color }" @click="enableSwipingAndHideTopicList(topic as string)">
                    <h3 class="topic-title">{{ topic }}</h3>
                </div>
            </template>
        </div>
    </div>

    <nav class="nav">
        <RouterLink to="/" class="nav__link nav__link--active">
            <img class="ionicon nav__icon--active" src="/assets/home.svg" />
            <span class="nav__text">Home</span>
        </RouterLink>
        <RouterLink to="/search" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
            <span class="nav__text">Search</span>
        </RouterLink>
        <RouterLink to="/bookmarks" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
            <span class="nav__text">Bookmarks</span>
        </RouterLink>
        <RouterLink to="/settings" class="nav__link">
            <img class="ionicon nav__icon" src="/assets/settings-outline.svg" />
            <span class="nav__text">Settings</span>
        </RouterLink>
    </nav>
</template>

<style>
@import "@/assets/css/song.css";
</style>

<style scoped>
.topic-list {
    scroll-snap-type: x mandatory;
    overflow-x: scroll;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    scrollbar-width: none;
    width: 100%;
    margin: 10px 0;
}

/**
 * Fix overflow scroll ignoring margin/padding.
 * @see https://chenhuijing.com/blog/flexbox-and-padding/
 * @see https://itnext.io/horizontal-overflow-with-flexbox-css-64f530495303
 */
.topic-list::before,
.topic-list::after {
    content: "";
    display: inline-block;
    flex: 0 0 auto;
    width: 300px;
    margin-left: -1px;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.topic-list::-webkit-scrollbar {
    display: none;
}

.topic-list {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.topic {
    height: 80px;
    min-width: calc(100vw - 30px);
    scroll-snap-stop: always;
    scroll-snap-align: center;

    text-align: center;
    color: white;
    border-radius: 15px;
    margin: 0px 15px;
}

.expanded-topic {
    margin: 10px 15px !important;
}

.topic-arrow {
    filter: invert(100%);
    display: inline-block;
    top: calc(50% - 50px / 2);
    position: relative;
    height: 50px;
    padding: 0px 10px;
}

.topic-title {
    color: white;
    display: inline-block;
    top: calc(50% - 50px / 2);
    position: relative;
    height: 50px;
    line-height: 50px;
    margin-top: 0px;
    margin-bottom: 0px;
}
</style>
