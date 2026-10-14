<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { TouchSwipe, useQuasar } from 'quasar';
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
import { useFavorites } from '@/composables/useFavorites';
import { useCityPager } from '@/composables/useCityPager';
import { cityId } from '@/utils/cityId';
import { useKeyboardNav } from '@/composables/useKeyboardNav';
import CityDots from '@/components/CityDots.vue';

const vTouchSwipe = TouchSwipe;

const DEFAULT_CITY = { name: 'Kyiv', lat: 50.45, lon: 30.52 };

const $q = useQuasar();
const { t } = useI18n();
const errorMessage = useErrorMessage();

const weather = useWeatherStore();
const { overview, status, errorCode, cityName, target } = storeToRefs(weather);

const { locating, permission, locateAndLoad } = useCurrentLocation();
const { isFavorite, toggleCurrent } = useFavorites();
const { pages, activeIndex, isTemporaryFirst, direction, go, goTo, resetDirection } =
  useCityPager();

const searchOpen = ref(false);

const showSkeleton = computed(() => !overview.value && status.value !== 'error');
const showDots = computed(() => pages.value.length > 1 && activeIndex.value >= 0);

const viewKey = computed(() =>
  target.value ? cityId(target.value.lat, target.value.lon) : 'empty',
);
const transitionName = computed(() =>
  direction.value === 'none' ? 'fade' : direction.value === 'next' ? 'slide-next' : 'slide-prev',
);

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
  await weather.load(DEFAULT_CITY);
}

onMounted(() => void start());

useAutoRefresh({
  refresh: () => weather.refresh(),
  lastUpdated: () => (overview.value ? new Date(overview.value.fetchedAt).getTime() : null),
});

useKeyboardNav(
  () => go(-1),
  () => go(1),
);

watch(status, (s) => {
  if (s === 'error' && overview.value) {
    $q.notify({
      message: errorMessage(errorCode.value),
      icon: 'mdi-cloud-alert-outline',
      classes: 'wx-toast',
    });
  }
});

function onSwipe(info: { direction?: string; evt?: Event }) {
  const el = info.evt?.target;
  if (el instanceof Element && el.closest('[data-no-swipe]')) return;

  if (info.direction === 'left') go(1);
  else if (info.direction === 'right') go(-1);
}

function onPick(place: Place) {
  resetDirection();
  void weather.load({ lat: place.lat, lon: place.lon, name: place.name });
}

function onLocate() {
  resetDirection();
  void locateAndLoad();
}

async function onRefresh(done: () => void) {
  await weather.refresh();
  done();
}
</script>

<template>
  <q-page>
    <q-pull-to-refresh
      no-mouse
      @refresh="onRefresh"
    >
      <div
        v-touch-swipe.horizontal="onSwipe"
        class="wx-container page"
      >
        <AppTopBar
          :locating="locating"
          :location-blocked="permission === 'denied'"
          @search="searchOpen = true"
          @locate="onLocate"
        />

        <CityDots
          v-if="showDots"
          :count="pages.length"
          :active="activeIndex"
          :temporary-first="isTemporaryFirst"
          @select="goTo"
        />

        <Transition
          :name="transitionName"
          mode="out-in"
        >
          <div :key="viewKey">
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
                :is-favorite="isFavorite"
                @toggle-favorite="toggleCurrent"
              />
              <HourlyStrip :overview="overview" />
              <DailyForecast
                v-if="overview.daily.length"
                :overview="overview"
              />
              <DetailsGrid :current="overview.current" />
            </div>
          </div>
        </Transition>
      </div>
    </q-pull-to-refresh>

    <CitySearchDialog
      v-model="searchOpen"
      @pick="onPick"
      @locate="onLocate"
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
