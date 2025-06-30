<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import NavigationBar from "@/components/NavigationBar.vue";
import BookFilter from "@/components/BookFilter.vue";
import { stripSearchText } from "@/scripts/search";
import { useSessionStorage } from "@vueuse/core";

const search_params = ref({ search: "", bookFilters: [] });
const search_query = ref(search_params.value.search);
const stripped_query = computed(() => {
    return stripSearchText(search_query.value);
});

watch(search_query, new_query => {
    search_params.value.search = new_query;
});

function clearSearchQuery() {
  search_query.value = "";
}

</script>

<template>
    <h1 class="pagetitle">Discover</h1>
	<div class="content-footer">
		<div class="prompt-container">
			<div class="prompt-input-wrapper" :class="{ 'prompt-input-wrapper-outline': search_query.length > 0 }">
				<div class="prompt-input">
					<img class="sparkles-icon" src="/assets/sparkles.svg"/>
					<input v-model="search_query" placeholder="Enter any topic, theme or lyrics" aria-label="Discover site content" />
				</div>
				<div class="prompt-menu">
					<BookFilter
						class="book-filter"
						:books="[]"
						:selected-books="[]"
						:dropdown-above="true"
						@update:selectedBooks="search_params.bookFilters = $event"
					/>
					<button v-if="search_query.length > 0" class="submit-prompt" @click="clearSearchQuery()">
						<img class="ionicon-md arrow-icon" src="/assets/arrow-up-outline.svg"/>
					</button>
				</div>
			</div>
		</div>
	</div>

    <NavigationBar current_page="discover" />
</template>

<style scoped>
	@import "@/assets/css/search.css";

	.content-footer {
		justify-self: center;
		position: absolute;
		bottom: 0;
		margin-bottom: 70px;
		max-width: 700px;
		left: 50%;
		width: 100%;
		-moz-transform: translate(-50%, 0); /* Firefox */
		-ms-transform: translate(-50%, 0);  /* IE 9 */
		-webkit-transform: translate(-50%, 0); /* Safari and Chrome*/
		-o-transform: translate(-50%, 0); /* Opera */
		transform: translate(-50%, 0);
	}

	.prompt-container {
		padding: 15px;
	}

	.prompt-input-wrapper {
		padding: 20px;
		background-color: var(--div-color);
		border-radius: 18px;
		box-shadow: var(--box-shadow);
	}

	.prompt-input-wrapper-outline {
		box-shadow: inset 0 0 0 2px mediumorchid;
	}

	.prompt-input {
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
</style>
