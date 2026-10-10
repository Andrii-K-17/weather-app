<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import type { Place } from '@/api/types';
import AppTopBar from '@/components/AppTopBar.vue';
import CitySearchDialog from '@/components/CitySearchDialog.vue';
import CurrentWeather from '@/components/weather/CurrentWeather.vue';
import DailyForecast from '@/components/weather/DailyForecast.vue';
import DetailsGrid from '@/components/weather/DetailsGrid.vue';
import ErrorCard from '@/components/weather/ErrorCard.vue';
import HomeSkeleton from '@/components/weather/HomeSkeleton.vue';
import HourlyStrip from '@/components/weather/HourlyStrip.vue';
import { useAutoRefresh } from '@/composables/useAutoRefresh';
import { useCurrentLocation } from '@/composables/useCurrentLocation';
import { useErrorMessage } from '@/composables/useErrorMessage';
import { useWeatherStore } from '@/stores/weather';

const $q = useQuasar();
const { t } = useI18n();
const errorMessage = useErrorMessage();

const weather = useWeatherStore();
const { overview, status, errorCode, cityName, target } = storeToRefs(weather);

const { locating, permission, locateAndLoad } = useCurrentLocation();

const searchOpen = ref(false);

const showSkeleton = computed(() => !overview.value && status.value !== 'error');

async function start() {
  if (weather.overview) return;
  const saved = weather.savedTarget();

  if (saved?.current) {
    if (!(await locateAndLoad({ quiet: true }))) await weather.load(saved);
    return;
  }
  if (saved) {
    await weather.load(saved);
    return;
  }

  if (await locateAndLoad({ quiet: true })) return;
}

onMounted(() => void start());

useAutoRefresh({
  refresh: () => weather.refresh(),
  lastUpdated: () => (overview.value ? new Date(overview.value.fetchedAt).getTime() : null),
});

watch(status, (s) => {
  if (s === 'error' && overview.value) {
    $q.notify({
      message: errorMessage(errorCode.value),
      icon: 'mdi-cloud-alert-outline',
      classes: 'wx-toast',
    });
  }
});

function onPick(place: Place) {
  void weather.load({ lat: place.lat, lon: place.lon, name: place.name });
}

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
    <q-pull-to-refresh
      no-mouse
      @refresh="onRefresh"
    >
      <div class="wx-container">
        <AppTopBar
          :locating="locating"
          :location-blocked="permission === 'denied'"
          @search="searchOpen = true"
          @locate="locateAndLoad()"
        />

        <HomeSkeleton v-if="showSkeleton" />

        <ErrorCard
          v-else-if="!overview"
          :code="errorCode"
          :retrying="status === 'loading'"
          @retry="weather.refresh()"
          @search="searchOpen = true"
        />

        <div
          v-else
          class="stack"
        >
          <CurrentWeather
            :overview="overview"
            :city-name="cityName"
            :is-current-location="target?.current ?? false"
          />
          <HourlyStrip :overview="overview" />
          <DailyForecast
            v-if="overview.daily.length"
            :overview="overview"
          />
          <DetailsGrid :current="overview.current" />
        </div>
      </div>
    </q-pull-to-refresh>

    <CitySearchDialog
      v-model="searchOpen"
      @pick="onPick"
      @locate="locateAndLoad()"
    />
  </q-page>
</template>

<style scoped lang="scss">
.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
