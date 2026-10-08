<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import AppTopBar from "@/components/AppTopBar.vue";
import HomeSkeleton from "@/components/weather/HomeSkeleton.vue";
import { useErrorMessage } from "@/composables/useErrorMessage";
import { useWeatherStore } from "@/stores/weather";
import CurrentWeather from "@/components/weather/CurrentWeather.vue";
import DetailsGrid from "@/components/weather/DetailsGrid.vue";

const { t } = useI18n();
const errorMessage = useErrorMessage();

const weather = useWeatherStore();
const { overview, status, errorCode, cityName } = storeToRefs(weather);

// Temporary default
const DEFAULT_CITY = { name: "Kyiv", lat: 50.45, lon: 30.52 };

const showSkeleton = computed(
  () => !overview.value && status.value !== "error",
);

onMounted(() => {
  if (!weather.overview) void weather.load(DEFAULT_CITY);
});
</script>

<template>
  <q-page>
    <div class="wx-container">
      <AppTopBar />

      <HomeSkeleton v-if="showSkeleton" />

      <div v-else-if="!overview" class="state wx-card">
        <q-icon name="mdi-cloud-off-outline" size="40px" class="wx-muted" />
        <p class="state-message">{{ errorMessage(errorCode) }}</p>
        <q-btn
          flat
          rounded
          no-caps
          :label="t('common.retry')"
          @click="weather.refresh()"
        />
      </div>

      <CurrentWeather v-else :overview="overview" :city-name="cityName" />

      <DetailsGrid v-if="overview" :current="overview.current" />
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
  padding: 32px 24px;
  text-align: center;
}

.state-message {
  margin: 0;
  color: var(--text-muted);
}
</style>
