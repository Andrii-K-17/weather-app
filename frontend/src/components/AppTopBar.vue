<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import { useWeatherStore } from "@/stores/weather";

const { t } = useI18n();
const settings = useSettingsStore();
const weather = useWeatherStore();

const ICONS = {
  system: "mdi-theme-light-dark",
  light: "mdi-weather-sunny",
  dark: "mdi-weather-night",
} as const;

const themeIcon = computed(() => ICONS[settings.theme]);
</script>

<template>
  <header class="topbar">
    <div class="app-title">{{ t("app.name") }}</div>
    <div class="topbar-actions">
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
  padding: 12px 4px 4px;
}

.app-title {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--text-muted);
}

.topbar-actions {
  display: flex;
  gap: 4px;
}
</style>
