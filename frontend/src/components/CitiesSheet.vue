<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import WeatherIcon from '@/components/weather/WeatherIcon.vue';
import { toTarget, useCityPager } from '@/composables/useCityPager';
import { useFavorites } from '@/composables/useFavorites';
import { useFormatters } from '@/composables/useFormatters';
import { useCitiesStore } from '@/stores/cities';
import { useWeatherStore } from '@/stores/weather';
import { cityId } from '@/utils/cityId';
import type { FavoriteCity } from '@/utils/favorites';
import { roundTemp } from '@/utils/format';
import { countryName } from '@/utils/place';

const open = defineModel<boolean>({ required: true });
const emit = defineEmits<{ search: [] }>();

const { t, locale } = useI18n();
const fmt = useFormatters();
const cities = useCitiesStore();
const weather = useWeatherStore();
const pager = useCityPager();
const favorites = useFavorites();

const loading = ref(false);

const activeId = computed(() =>
  weather.target ? cityId(weather.target.lat, weather.target.lon) : null,
);

// Loads mini forecasts for every saved city when the sheet opens
watch(open, async (isOpen) => {
  if (!isOpen || !cities.items.length) return;
  loading.value = true;
  try {
    await weather.prefetch(cities.items.map(toTarget));
  } finally {
    loading.value = false;
  }
});

function subtitle(c: FavoriteCity): string {
  const country = countryName(c.country, locale.value);
  const snap = weather.snapshot(c.lat, c.lon);
  if (!snap) return country;
  const time = fmt.time(Math.floor(Date.now() / 1000), snap.location.timezoneOffset);

  return [country, time].filter(Boolean).join(' · ');
}

function onPick(c: FavoriteCity) {
  pager.goToFavorite(c);
  open.value = false;
}

function onAdd() {
  open.value = false;
  emit('search');
}
</script>

<template>
  <q-dialog
    v-model="open"
    position="bottom"
  >
    <div
      class="sheet"
      role="dialog"
      aria-modal="true"
      :aria-label="t('favorites.title')"
    >
      <div class="header">
        <h2 class="title">{{ t('favorites.title') }}</h2>
        <q-btn
          flat
          rounded
          no-caps
          icon="mdi-plus"
          :label="t('favorites.addCity')"
          @click="onAdd"
        />
      </div>

      <div
        v-if="!cities.items.length"
        class="empty"
      >
        <q-icon
          name="mdi-heart-outline"
          size="36px"
          class="empty-icon"
        />
        <p class="empty-title">{{ t('favorites.empty') }}</p>
        <p class="empty-hint">{{ t('favorites.emptyHint') }}</p>
      </div>

      <ul
        v-else
        class="list"
      >
        <li
          v-for="c in cities.items"
          :key="c.id"
          class="city"
          :class="{ 'city-active': c.id === activeId }"
        >
          <button
            type="button"
            class="city-main"
            @click="onPick(c)"
          >
            <span class="city-info">
              <span class="city-name">{{ c.name }}</span>
              <span class="city-subtitle">{{ subtitle(c) }}</span>
            </span>

            <span class="city-weather">
              <template v-if="weather.snapshot(c.lat, c.lon)">
                <WeatherIcon
                  :condition="weather.snapshot(c.lat, c.lon)!.current.condition"
                  size="26px"
                />
                <span class="city-temperature">
                  {{ roundTemp(weather.snapshot(c.lat, c.lon)!.current.temp) }}°
                </span>
              </template>
              <q-skeleton
                v-else-if="loading"
                type="rect"
                width="64px"
                height="28px"
                animation="pulse"
              />
              <span
                v-else
                class="wx-muted"
              >
                –
              </span>
            </span>
          </button>

          <q-btn
            flat
            round
            size="sm"
            icon="mdi-close"
            class="wx-icon-btn"
            :aria-label="t('favorites.remove')"
            @click="favorites.remove(c)"
          />
        </li>
      </ul>
    </div>
  </q-dialog>
</template>

<style scoped lang="scss">
.sheet {
  width: min(560px, 100vw);
  max-width: 100%;
  max-height: 75vh;
  margin: 0 auto;
  overflow-y: auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--sheet);
  color: var(--text);
  scrollbar-width: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px 24px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.list {
  margin: 0;
  padding: 0 0 16px;
  list-style: none;
}

.empty {
  padding: 32px 24px 40px;
  text-align: center;
}

.empty-icon {
  color: var(--text-faint);
}

.empty-title {
  margin: 8px 0 2px;
  font-size: 16px;
}

.empty-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.city {
  display: flex;
  align-items: center;
  padding-right: 12px;
}

.city-active {
  background: var(--divider);
}

.city-main {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 8px 14px 24px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.city-info {
  display: flex;
  flex-direction: column;
}

.city-name {
  font-size: 17px;
}

.city-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.city-weather {
  display: flex;
  align-items: center;
  gap: 8px;
}

.city-temperature {
  min-width: 40px;
  font-size: 22px;
  font-weight: 300;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
