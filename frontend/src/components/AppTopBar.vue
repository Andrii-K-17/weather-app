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
    <div class="btns-l">
      <button
        type="button"
        class="pill card"
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
        class="wx-icon-btn fav-list-btn"
        icon="mdi-format-list-bulleted"
        :aria-label="t('favorites.title')"
        @click="emit('cities')"
      />
    </div>

    <div class="btns-r">
      <q-btn
        flat
        round
        class="wx-icon-btn"
        :icon="locationBlocked ? 'mdi-crosshairs-off' : 'mdi-crosshairs-gps'"
        :loading="locating"
        :aria-label="t('location.use')"
        @click="emit('locate')"
      />

      <q-btn
        flat
        round
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
        no-caps
        class="wx-icon-btn lang-btn"
        :label="t('language.short')"
        :aria-label="t('language.switch')"
        @click="settings.toggleLanguage()"
      />
      <q-btn
        flat
        round
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
  padding: 10px 0 4px;
}

.btns-r {
  display: flex;
  flex-direction: row;
  gap: 7px;
}

.btns-l {
  display: flex;
  flex-direction: row;
}

.fav-list-btn {
  margin: auto;
  padding: 0px 15px 0px 12px;
  background: var(--surface);
  border-width: 1px 1px 1px 0;
  border-style: solid;
  border-color: var(--surface-border);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  transition: background-color 0.2s ease;

  :deep(.q-icon) {
    font-size: 20px;
  }
}

.pill {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 15px;
  border-radius: 1000px;
  color: var(--text-muted);
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pill:hover,
.fav-list-btn:hover {
  background-color: var(--topbar-hover);
}

.btns-r :deep(.wx-icon-btn) {
  transition: background-color 0.2s ease;
}

.btns-r :deep(.wx-icon-btn:hover) {
  background-color: var(--surface);
}

.btns-r :deep(.lang-btn) {
  font-size: 13px;
  font-weight: 600;
}

.card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}
</style>
