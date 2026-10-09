<script setup lang="ts">
import { computed, onMounted, watch, ref } from "vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import AppTopBar from "@/components/AppTopBar.vue";
import CurrentWeather from "@/components/weather/CurrentWeather.vue";
import DailyForecast from "@/components/weather/DailyForecast.vue";
import DetailsGrid from "@/components/weather/DetailsGrid.vue";
import HomeSkeleton from "@/components/weather/HomeSkeleton.vue";
import HourlyStrip from "@/components/weather/HourlyStrip.vue";
import { useAutoRefresh } from "@/composables/useAutoRefresh";
import { useErrorMessage } from "@/composables/useErrorMessage";
import { useWeatherStore } from "@/stores/weather";
import type { Place } from "@/api/types";
import CitySearchDialog from "@/components/CitySearchDialog.vue";

const $q = useQuasar();
const { t } = useI18n();
const errorMessage = useErrorMessage();

const weather = useWeatherStore();
const { overview, status, errorCode, cityName } = storeToRefs(weather);

// Temporary default
const DEFAULT_CITY = { name: "Kyiv", lat: 50.45, lon: 30.52 };

const showSkeleton = computed(
  () => !overview.value && status.value !== "error",
);

const searchOpen = ref(false);

function onPick(place: Place) {
  void weather.load({ lat: place.lat, lon: place.lon, name: place.name });
}

onMounted(() => {
  if (!weather.overview) void weather.load(DEFAULT_CITY);
});

useAutoRefresh({
  refresh: () => weather.refresh(),
  lastUpdated: () =>
    overview.value ? new Date(overview.value.fetchedAt).getTime() : null,
});

watch(status, (s) => {
  if (s === "error" && overview.value) {
    $q.notify({
      message: errorMessage(errorCode.value),
      icon: "mdi-cloud-alert-outline",
      classes: "wx-toast",
    });
  }
});

async function onRefresh(done: () => void) {
  try {
    await weather.refresh();
  } finally {
    done();
  }
}
</script>

<template>
  <q-page>
    <q-pull-to-refresh no-mouse @refresh="onRefresh">
      <div class="wx-container">
        <AppTopBar @search="searchOpen = true" />

        <HomeSkeleton v-if="showSkeleton" />

        <div v-else-if="!overview" class="state wx-card" role="alert">
          <q-icon name="mdi-cloud-off-outline" size="40px" class="wx-muted" />
          <p class="state-message">{{ errorMessage(errorCode) }}</p>
          <q-btn
            flat
            rounded
            :label="t('common.retry')"
            @click="weather.refresh()"
          />
        </div>

        <div v-else class="stack">
          <CurrentWeather :overview="overview" :city-name="cityName" />
          <HourlyStrip :overview="overview" />
          <DailyForecast v-if="overview.daily.length" :overview="overview" />
          <DetailsGrid :current="overview.current" />
        </div>
      </div>
    </q-pull-to-refresh>

    <CitySearchDialog v-model="searchOpen" @pick="onPick" />
  </q-page>
</template>

<style scoped lang="scss">
.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

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
