<script setup lang="ts">
import { RouterLink, onBeforeRouteLeave, useRoute } from "vue-router";
import { ref, computed, onMounted, watch, nextTick } from "vue";
import NavigationBar from "@/components/NavigationBar.vue";
import BookFilter from "@/components/BookFilter.vue";
import { stripSearchText } from "@/scripts/search";
import { useSessionStorage } from "@vueuse/core";
import { getAllSongMetaData, getAllBookMetaData, getBookDataSummaryFromName } from "@/scripts/book_import";
import { type BookSummary, type Song, type SongSearchInfo, type SearchParams, type BookDataSummary, type DiscoverResult } from "@/scripts/types";
import { known_references, prepackaged_books } from "@/scripts/constants";
import { saveScrollPosition, restoreScrollPosition } from "@/router/scroll";
import { Keyboard, type KeyboardInfo } from '@capacitor/keyboard'
import { Capacitor } from "@capacitor/core";

// Saving position in book
onBeforeRouteLeave((_, from) => {
	saveScrollPosition(from.fullPath);
});

const route = useRoute();

const keyboard_height = ref(0);

const query_suggestions = ref(["God’s faithfulness", "Forgiveness and grace", "Christmas", "The Holy Trinity", "Victory over sin and death"]);
const search_params = ref<SearchParams>({ search: "", bookFilters: [] });
const search_query = ref(search_params.value.search);
const top_results = ref([]);

const result_data = ref<DiscoverResult | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
let platform = ref<string>(Capacitor.getPlatform());

if (platform.value !== "web") {
	Keyboard.addListener("keyboardWillShow", (info: KeyboardInfo) => {
		keyboard_height.value = info.keyboardHeight;
	});
	Keyboard.addListener("keyboardWillHide", () => {
		keyboard_height.value = 0;
	});
}

async function handleSubmit() {
	loading.value = true;
	try {
		const resp = await fetch('https://api.acchymns.app/discover', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': import.meta.env.VITE_ACC_HYMNS_KEY,
			},
			body: JSON.stringify({
				'prompt': search_query.value,
				'hymnals': search_params.value.bookFilters.length > 0 ? search_params.value.bookFilters : ["all"],
				'search_type': 'both',
				'top_k': 10
			}),
		})

		if (!resp.ok) throw new Error('POST Request failed.');

		result_data.value = await resp.json() as DiscoverResult;
	} catch (err) {
		error.value = "An error occured. Please try again later.";
	} finally {
		loading.value = false;
		clearFields();
	}
}

function clearFields() {
	search_query.value = "";
	search_params.value.bookFilters = [];
}

watch(search_query, new_query => {
	search_params.value.search = new_query;
});

const SUPPORTED_BOOKS = ["ZH", "GH"];
const available_songs = ref<SongSearchInfo[]>([]);
const available_books = ref<BookSummary[]>([]);
const book_data_summaries = ref<Map<string, BookDataSummary>>(new Map<string, BookDataSummary>());

onMounted(async () => {
	const BOOK_METADATA = await getAllBookMetaData();
	const SONG_METADATA = await getAllSongMetaData();
	available_books.value.push(...Object.values(BOOK_METADATA));
	for (const book of Object.keys(SONG_METADATA)) {
		for (const song_number of Object.keys(SONG_METADATA[book])) {
			let song: Song = SONG_METADATA[book][song_number];

			if (song.title == undefined) song.title = "";

			available_songs.value.push({
				title: song?.title ?? "",
				number: song_number,
				book: BOOK_METADATA[book],
			} as SongSearchInfo);
		}
	}

	prepackaged_books.concat(Object.keys(known_references)).forEach(async book => {
		let book_data: BookDataSummary | undefined = await getBookDataSummaryFromName(book);
		if (book_data == undefined) return;
		book_data_summaries.value.set(book, book_data);
	});

	// Restoring position in book
	await nextTick();
	// The v-for for song buttons now should be active, so we can scroll to the saved position
	restoreScrollPosition(route.fullPath);
});

</script>

<template>
	<h1 class="pagetitle">Discover</h1>
	<h2 v-if="result_data && !loading" style="margin-top: 10px; margin-bottom: 10px">Top Results ({{
		result_data.top_matches.length
	}})</h2>
	<span v-if="error" style="margin-left: 30px; color: salmon">{{ error }}</span>
	<div v-if="result_data && !loading" class="songlist" style="margin-bottom: 160px">
		<RouterLink v-for="song in result_data.top_matches" :key="song.hymn_number + song.hymnal_id"
			:to="`/display/${song.hymnal_id}/${song.hymn_number}`" class="song"
			:style="`background: linear-gradient(135deg, ${available_books.find(b => b.name.short === song.hymnal_id)?.primaryColor}, ${available_books.find(b => b.name.short === song.hymnal_id)?.secondaryColor})`">
			<div>
				<div class="song__title">{{available_songs.find(s => s.number === song.hymn_number && s.book.name.short
					=== song.hymnal_id)?.title}}</div>
				<div class="book__title">{{available_books.find(b => b.name.short === song.hymnal_id)?.name.medium}}
				</div>
			</div>
			<div class="booktext--right">
				<div class="song__number">#{{ song.hymn_number }}</div>
			</div>
		</RouterLink>
	</div>
	<div v-else-if="loading" class="lds-ring-container">
		<!--Loading Ring-->
		<div class="lds-ring">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
	<div class="content-footer" :style="{ marginBottom: 80 + keyboard_height + 'px' }">
		<div v-if="search_query.length == 0 && !result_data" class="suggestions-wrapper"
			:class="{ 'hide-scrollbar': platform !== 'web' }">
			<button v-for="suggestion in query_suggestions" class="suggestion-pill" :key="suggestion"
				@click="search_query = suggestion">
				{{ suggestion }}
			</button>
		</div>
		<div class="prompt-input-wrapper" :class="{ 'prompt-input-wrapper-outline': search_query.length > 0 }">
			<div class="prompt-input">
				<img class="sparkles-icon" src="/assets/sparkles.svg" />
				<input v-model="search_query" placeholder="Enter any topic, theme or lyrics..."
					aria-label="Discover site content" @keypress.enter="handleSubmit" />
			</div>
			<div class="prompt-menu">
				<BookFilter class="book-filter"
					:books="available_books.filter(b => SUPPORTED_BOOKS.includes(b.name.short))"
					:selected-books="search_params.bookFilters" :dropdown-above="true"
					@update:selectedBooks="(e) => search_params.bookFilters = e" />
				<button v-if="search_query.length > 0" :disabled="loading" class="submit-prompt"
					@click="handleSubmit()">
					<img class="ionicon-md arrow-icon" src="/assets/arrow-up-outline.svg" />
				</button>
			</div>
		</div>
	</div>

	<NavigationBar current_page="discover" />
</template>

<style scoped>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";

@keyframes fade-in-1s-delay {
	0% {
		opacity: 0%;
	}

	100% {
		opacity: 100%;
	}
}

.lds-ring-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(50vh - 61.16px);
	margin-top: 61.16px;
	animation: 1s fade-in-1s-delay;
}

.lds-ring {
	/* change color here */
	color: var(--back-color);
}

.lds-ring,
.lds-ring div {
	box-sizing: border-box;
}

.lds-ring {
	display: inline-block;
	position: relative;
	width: 64px;
	height: 64px;
}

.lds-ring div {
	box-sizing: border-box;
	display: block;
	position: absolute;
	width: 64px;
	height: 64px;
	border: 6px solid currentColor;
	border-radius: 50%;
	animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	border-color: currentColor transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
	animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
	animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
	animation-delay: -0.15s;
}

@keyframes lds-ring {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.content-footer {
	justify-self: center;
	position: fixed;
	bottom: 0;
	max-width: 700px;
	left: 50%;
	width: 100%;
	-moz-transform: translate(-50%, 0);
	/* Firefox */
	-ms-transform: translate(-50%, 0);
	/* IE 9 */
	-webkit-transform: translate(-50%, 0);
	/* Safari and Chrome*/
	-o-transform: translate(-50%, 0);
	/* Opera */
	transform: translate(-50%, 0);
	transition: margin-bottom 0.3s ease;
}

.prompt-input-wrapper {
	margin: 0 15px;
	padding: 20px;
	background-color: var(--div-color);
	border-radius: 18px;
	box-shadow: var(--box-shadow);
	border: 3px solid transparent
}

.prompt-input-wrapper-outline {
	border: 3px solid transparent;
	border-radius: 12px;
	background:
		linear-gradient(var(--div-color), var(--div-color)) padding-box,
		conic-gradient(from var(--angle), var(--div-color), #C95EFF, #94ABFF, var(--div-color)) border-box;
	animation: rotate 10s linear infinite;
	background-origin: border-box;
	background-clip: padding-box, border-box;
}

@keyframes rotate {
	to {
		--angle: 1turn;
	}
}

@property --angle {
	syntax: "<angle>";
	initial-value: 0turn;
	inherits: false;
}


.prompt-input {
	user-select: none;
	display: flex;
	align-items: center;
}

.sparkles-icon {
	width: 16px;
	height: 16px;
}

.prompt-menu {
	margin-top: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.submit-prompt {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 60px;
	border: var(--border-color);
	width: 46px;
	height: 46px;
}

.arrow-icon {
	filter: var(--change-svg-filter)
}

.hide-scrollbar {
	-ms-overflow-style: none;
	/* IE and Edge */
	scrollbar-width: none;
	/* Firefox */
}

.suggestions-wrapper {
	margin: 0 0 15px 0;
	gap: 10px;
	display: flex;
	flex-wrap: nowrap;
	overflow: auto;
	scroll-padding-bottom: 8px;
	padding-left: 12px;
	padding-right: 12px;
	padding-bottom: 8px;
	-ms-overflow-style: none;

	&:after {
		content: "";
		position: absolute;
		z-index: 0;
		top: 0;
		right: 0;
		bottom: 150px;
		pointer-events: none;
		background-image: linear-gradient(to right, rgba(255, 255, 255, 0), var(--background) 85%);
		width: 15px;
	}

	&:before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		bottom: 150px;
		pointer-events: none;
		background-image: linear-gradient(to left, rgba(255, 255, 255, 0), var(--background) 85%);
		width: 15px;
	}
}

.suggestions-wrapper::-webkit-scrollbar {
	padding: 8px;
	height: 6px;
	background: transparent;
}

.suggestions-wrapper::-webkit-scrollbar-thumb {
	background: linear-gradient(90deg, #C95EFF 0%, #94ABFF 100%);
	border-radius: 8px;
}

.suggestion-pill {
	flex: 0 0 auto;
	padding: 0px 18px;
	border-radius: 18px;
	background-color: var(--pill-color);
	color: var(--subtext-color);
	transition: opacity 0.2s ease;
	opacity: 100%;
	user-select: none;

	&:first-child {
		margin-left: 15px;
	}
}

.suggestion-pill:active {
	opacity: 50%;
}
</style>
