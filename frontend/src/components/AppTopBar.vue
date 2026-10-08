<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";

const { t } = useI18n();
const settings = useSettingsStore();

const ICONS = {
  system: "mdi-theme-light-dark",
  light: "mdi-weather-sunny",
  dark: "mdi-weather-night",
} as const;

const themeIcon = computed(() => ICONS[settings.theme]);
</script>

<template>
  <header class="topbar">
    <div class="topbar__title">{{ t("app.name") }}</div>
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
  justify-content: space-between;
  padding: 12px 4px 4px;
}

.topbar__title {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--text-muted);
}
</style>
