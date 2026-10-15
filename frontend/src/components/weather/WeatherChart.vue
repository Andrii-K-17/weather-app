<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';

const props = defineProps<{ temperatures: number[] }>();

const chartWidth = computed(() => props.temperatures.length * 65 - 5);
const range = computed(() => {
  const min = Math.min(...props.temperatures);
  const max = Math.max(...props.temperatures);
  const padding = Math.max(max - min, 1);

  return { min: min - padding, max: max + padding };
});

const series = computed(() => [
  {
    name: 'Temperature',
    data: props.temperatures,
  },
]);

const options = computed<ApexOptions>(() => ({
  chart: {
    type: 'line',
    width: chartWidth.value,
    height: 70,
    toolbar: { show: false },
    animations: { enabled: false },
    parentHeightOffset: 0,
    zoom: { enabled: false },
    foreColor: 'var(--text)',
  },
  colors: ['var(--tone-rain)'],
  dataLabels: { enabled: false },
  grid: {
    show: false,
    padding: { left: 30, right: 30, top: 2, bottom: 2 },
  },
  markers: {
    size: 3,
    strokeWidth: 1,
    strokeColors: 'var(--surface)',
    hover: { size: 3 },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    lineCap: 'round',
  },
  tooltip: { enabled: false },
  xaxis: {
    categories: props.temperatures.map((_, index) => `${index}`),
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    show: false,
    min: range.value.min,
    max: range.value.max,
  },
}));
</script>

<template>
  <div
    v-if="temperatures.length"
    class="chart-widget"
    aria-hidden="true"
  >
    <VueApexCharts
      type="line"
      :width="chartWidth"
      :height="80"
      :options="options"
      :series="series"
    />
  </div>
</template>

<style scoped lang="scss">
.chart-widget {
  flex: 0 0 auto;
  width: max-content;
  height: 70px;
  margin: -20px 0 0;
}
</style>
