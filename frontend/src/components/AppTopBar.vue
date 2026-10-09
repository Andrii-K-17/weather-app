<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import { useWeatherStore } from "@/stores/weather";

const emit = defineEmits<{ search: [] }>();

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
    <button type="button" class="pill wx-card" @click="emit('search')">
      <q-icon name="mdi-magnify" size="20px" />
      <span>
        {{ t("search.placeholder") }}
      </span>
    </button>

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
  </header>
</template>

<style scoped lang="scss">
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0 4px;
}

.pill {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--text-muted);
  font: inherit;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}
</style>
