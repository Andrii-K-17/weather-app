<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { CurrentWeather } from "@/api/types";
import DetailTile from "@/components/weather/DetailTile.vue";
import { useFormatters } from "@/composables/useFormatters";
import { roundTemp } from "@/utils/format";

const props = defineProps<{ current: CurrentWeather }>();

const { t } = useI18n();
const fmt = useFormatters();

const windKmh = computed(() => Math.round(props.current.windSpeed * 3.6));

const visibility = computed(() => {
  const m = props.current.visibility;
  return m >= 1000
    ? `${fmt.number(m / 1000, 1)} ${t("units.km")}`
    : `${m} ${t("units.m")}`;
});

// Wind direction is where it blows FROM; the arrow shows where it blows TO
const windArrowStyle = computed(() => ({
  transform: `rotate(${props.current.windDeg + 180}deg)`,
}));
</script>

<template>
  <div class="grid">
    <DetailTile
      icon="mdi-thermometer"
      :label="t('weather.feelsLike')"
      :value="`${roundTemp(current.feelsLike)}°`"
    />
    <DetailTile
      icon="mdi-water-percent"
      :label="t('weather.humidity')"
      :value="`${current.humidity}%`"
      :meter="current.humidity"
    />
    <DetailTile
      icon="mdi-weather-windy"
      :label="t('weather.wind')"
      :value="`${windKmh} ${t('units.kmh')}`"
    >
      <template #suffix>
        <q-icon
          name="mdi-arrow-up"
          size="16px"
          :style="windArrowStyle"
          aria-hidden="true"
        />
      </template>
    </DetailTile>
    <DetailTile
      icon="mdi-gauge"
      :label="t('weather.pressure')"
      :value="`${current.pressure} ${t('units.hpa')}`"
    />
    <DetailTile
      icon="mdi-eye-outline"
      :label="t('weather.visibility')"
      :value="visibility"
    />
    <DetailTile
      icon="mdi-cloud-outline"
      :label="t('weather.cloudiness')"
      :value="`${current.clouds}%`"
      :meter="current.clouds"
    />
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
