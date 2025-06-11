<script setup lang="ts">
const props = defineProps<{
    dropdown_open: boolean;
}>();
</script>

<template>
    <Transition>
        <div class="dropdown-content-wrapper" v-show="props.dropdown_open">
            <div class="dropdown-content">
                <slot></slot>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: all 0.2s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(-15px);
}

.dropdown-content-wrapper {
    position: absolute;
    z-index: 2;
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
}

.dropdown-content > * {
    color: var(--color);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
}
.dropdown-content > *:active,
.dropdown-content > *:hover {
    background-color: var(--button-active-color);
    border-radius: 15px;
}
</style>
