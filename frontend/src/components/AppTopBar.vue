<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { useWeatherStore } from '@/stores/weather';

defineProps<{ locating?: boolean; locationBlocked?: boolean }>();
const emit = defineEmits<{ search: []; locate: []; cities: [] }>();

const { t } = useI18n();
const settings = useSettingsStore();
const weather = useWeatherStore();

const ICONS = {
  system: 'mdi-theme-light-dark',
  light: 'mdi-weather-sunny',
  dark: 'mdi-weather-night',
} as const;

const themeIcon = computed(() => ICONS[settings.theme]);
</script>

<template>
  <header class="topbar">
    <div class="btns">
      <button
        type="button"
        class="pill wx-card"
        @click="emit('search')"
      >
        <q-icon
          name="mdi-magnify"
          size="20px"
        />
        <span>
          {{ t('search.placeholder') }}
        </span>
      </button>
      <q-btn
        flat
        round
        dense
        class="wx-icon-btn fav-list-btn"
        icon="mdi-format-list-bulleted"
        :aria-label="t('favorites.title')"
        @click="emit('cities')"
      />
    </div>

    <div class="btns">
      <q-btn
        flat
        round
        dense
        class="wx-icon-btn"
        :icon="locationBlocked ? 'mdi-crosshairs-off' : 'mdi-crosshairs-gps'"
        :loading="locating"
        :aria-label="t('location.use')"
        @click="emit('locate')"
      />

      <q-btn
        flat
        round
        dense
        class="wx-icon-btn"
        icon="mdi-refresh"
        :loading="weather.status === 'refreshing'"
        :disable="!weather.target"
        :aria-label="t('common.refresh')"
        @click="weather.refresh()"
      />
      <q-btn
        flat
        round
        dense
        class="wx-icon-btn"
        :icon="themeIcon"
        :aria-label="t(`theme.${settings.theme}`)"
        @click="settings.cycleTheme()"
      />
    </div>
  </header>
</template>

<style scoped lang="scss">
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0 4px;
}

.btns {
  display: flex;
  flex-direction: row;
  gap: 7px;
}

.fav-list-btn {
  margin: auto;
}

.pill {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 15px;
  border-radius: 1000px;
  color: var(--text-muted);
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(1.2);
  }
}
</style>
