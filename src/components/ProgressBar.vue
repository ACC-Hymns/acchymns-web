<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{
    radius: number,
    progress: number,
    stroke: number
}>();

const normalizedRadius = props.radius - props.stroke * 2;
const circumference = normalizedRadius * 2 * Math.PI;
const strokeDashoffset = computed(() => {
    return circumference - props.progress / 100 * circumference;
})

</script>
<template>
    <svg :height="radius * 2" :width="radius * 2" style="overflow: visible; padding: 0px;">
    <circle
      stroke="white"
      fill="transparent"
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset }"
      :stroke-width="stroke"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
      transform="rotate(-90) translate(-25 -8)"
    />
  </svg>
</template>