<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import NavigationBar from "@/components/NavigationBar.vue";
</script>

<template>
    <h1 class="pagetitle">Discover</h1>
	<div class="content-footer">
		<div class="prompt-container">
			<div class="prompt-input-wrapper">
				<div class="prompt-input">
					<img class="sparkles-icon" src="/assets/sparkles.svg"/>
					<input v-model="search_query" placeholder="Enter any topic, theme or lyrics" aria-label="Discover site content" />
				</div>
				<div class="prompt-menu">

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
		padding: 15px 10px;
		background-color: var(--div-color);
		border-radius: 18px;
		box-shadow: var(--box-shadow);
	}

	.prompt-input {
		display: flex;
		align-items: center;
	}

	.sparkles-icon {
		padding: 0 0 0 10px;
		width: 16px;
		height: 16px;
	}
</style>
