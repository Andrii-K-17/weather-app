<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { WeatherOverview } from "@/api/types";
import WeatherIcon from "@/components/weather/WeatherIcon.vue";
import { useFormatters } from "@/composables/useFormatters";
import { roundTemp } from "@/utils/format";

const props = defineProps<{
  overview: WeatherOverview;
  cityName: string;
  isCurrentLocation?: boolean;
}>();

const { t } = useI18n();
const fmt = useFormatters();

const current = computed(() => props.overview.current);
</script>

<template>
  <section class="current-weather">
    <div class="city-name">
      <q-icon
        v-if="isCurrentLocation"
        name="mdi-compass-outline"
        size="18px"
        class="current-gps"
      />
      {{ cityName }}
    </div>

    <div class="temperature wx-temp">
      {{ roundTemp(current.temp) }}<span class="temperature-degree">°</span>
    </div>

    <div class="condition">
      <WeatherIcon :condition="current.condition" size="26px" />
      <span class="condition-description">{{
        current.condition.description
      }}</span>
    </div>

    <div class="range wx-muted">
      {{ t("weather.high") }} {{ roundTemp(current.tempMax) }}° ·
      {{ t("weather.low") }} {{ roundTemp(current.tempMin) }}°
    </div>

    <div class="updated-at">
      {{ t("home.updatedAt", { time: fmt.updatedAt(overview.fetchedAt) }) }}
    </div>
  </section>
</template>

<style scoped lang="scss">
.current-weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 20px;
  text-align: center;
}

.city-name {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 22px;
  font-weight: 400;
}

.temperature {
  position: relative;
  display: inline-block;
  margin: 8px 0 4px;
}

.temperature-degree {
  position: absolute;
  top: 0.06em;
  left: 100%;
  font-size: 0.45em;
  font-weight: 300;
}

.condition {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.condition-description::first-letter {
  text-transform: uppercase;
}

.range {
  margin-top: 6px;
  font-size: 15px;
}

.updated-at {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-faint);
}

.current-gps {
  margin-right: 4px;
  color: var(--text-muted);
}
</style>
