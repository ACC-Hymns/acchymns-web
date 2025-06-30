<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { type BookSummary } from "@/scripts/types";
import { hexToRgb, Color, Solver } from "@/scripts/color";

const props = defineProps<{
  books: BookSummary[];
  selectedBooks: string[];
  dropdownAbove?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:selectedBooks", value: string[]): void;
}>();

const is_open = ref(false);
const dropdown_animation = ref(false);

function resetDropdown() {
  dropdown_animation.value = false;
  setTimeout(() => {
    is_open.value = false;
  }, 200);
}

function toggleDropdown() {
  if (is_open.value) {
    resetDropdown();
  } else {
    is_open.value = true;
    dropdown_animation.value = true;
  }
}

function filterBook(shortBookName: string) {
  const updated = [...props.selectedBooks];
  const index = updated.indexOf(shortBookName);
  if (index > -1) {
    updated.splice(index, 1);
  } else {
    updated.push(shortBookName);
  }
  emit("update:selectedBooks", updated);
}

function clearFilters() {
  emit("update:selectedBooks", []);
}

function checkmarked(selected: boolean) {
  return selected ? "./assets/checkmark-circle.svg" : "./assets/ellipse-outline.svg";
}

function calculateIconFilter(color: string) {
    const rgb = hexToRgb(color ?? "#000000");
    if (rgb?.length !== 3) {
        return "";
    }
    const solver = new Solver(new Color(rgb[0], rgb[1], rgb[2]));
    const result = solver.solve();
    return result.filter;
}
</script>

<template>
  <div class="filters" v-on-click-outside="resetDropdown">
    <a @click="toggleDropdown" class="dropdown">
      <p class="dropdown-text">Filters</p>
      <img class="ionicon filter-icon" src="/assets/filter-outline.svg" />
    </a>
    <div class="dropdown-content-wrapper" :class="{ 'dropdown-above' : dropdownAbove}" v-show="is_open">
      <div class="dropdown-content" :class="{ 'dropdown-content-active': dropdown_animation }">
        <a>
          <div class="dropdown-content-top-item" @click="clearFilters">
            <img class="ionicon checkmark-icon" :src="checkmarked(selectedBooks.length === 0)" />
            <div class="dropdown-content-text">All Hymnals</div>
          </div>
        </a>
        <div :class="{ 'dropdown-content-organizer': books.length > 6 }">
          <a v-for="book in books" :key="book.name.medium" @click="filterBook(book.name.short)">
            <div class="dropdown-content-item">
              <img
                class="ionicon"
                :src="checkmarked(selectedBooks.includes(book.name.short))"
                :style="calculateIconFilter(book.primaryColor)"
              />
              <div class="dropdown-content-text">{{ book.name.medium }}</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";

@keyframes fadeIn {
    from {
        visibility: visible;
        opacity: 0;
        transform: translateY(-15px);
    }
    to {
        opacity: 1;
        transform: translateY(0px);
        visibility: visible;
    }
}

@keyframes fadeOut {
    from {
        visibility: visible;
        opacity: 1;
        transform: translateY(0px);
    }
    to {
        opacity: 0;
        transform: translateY(-15px);
        visibility: hidden;
    }
}

.dropdown-content-wrapper {
    z-index: 1;
    position: absolute;
    transition: all 0.2s ease;
}

.dropdown-above {
    bottom: 100%;
}

.dropdown-content {
    position: relative;
    background-color: var(--button-color);
    color: var(--color);
    border-radius: 15px;
    min-width: 160px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    z-index: 1;
    margin-top: 10px;
    padding-bottom: 5px;
    animation-name: fadeOut;
    animation-duration: 0.2s;
    animation-fill-mode: both;
}

.dropdown-content-organizer {
    display: grid;
    grid-template-columns: 45vw 45vw;
    max-height: 300px;
    overflow-y: auto;

    @media (min-width: 641px) {
        grid-template-columns: 1fr 1fr;
    }
}

.dropdown-content-top-item {
    cursor: pointer;
    border-bottom: var(--border-color);
    padding: 0px 15px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.dropdown-content-active {
    visibility: visible;
    animation-name: fadeIn;
    animation-duration: 0.2s;
}

.dropdown-content-item {
    cursor: pointer;
    padding: 0px 15px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.dropdown-content-text {
    padding: 15px 0px 15px 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dropdown {
    cursor: pointer;
    background-color: var(--button-color);
    color: var(--color);
    padding: 10px 15px;
    border-radius: 30px;
    border: var(--border-color);
    display: flex;
    justify-content: center;
    margin-top: 5px;
    margin-right: 10px;
    z-index: 1;
}

.dropdown-text {
    margin: 0;
    height: 25px;
    line-height: 25px;
}

.filter-icon {
    filter: var(--change-svg-filter);
    display: inline-block;
    position: relative;
    margin: auto auto;
    padding-left: 15px;
}

.checkmark-icon {
    filter: var(--svg-color);
}
</style>

