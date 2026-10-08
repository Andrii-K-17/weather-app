<script setup lang="ts">
import { useWeatherStore } from "@/stores/weather";

const weather = useWeatherStore();
</script>

<template>
  <q-layout
    view="hHh lpR fFf"
    class="app-sky"
    :class="`scene--${weather.scene}`"
  >
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
