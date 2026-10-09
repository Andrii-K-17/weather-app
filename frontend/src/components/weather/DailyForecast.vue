<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { DailyPoint, WeatherOverview } from "@/api/types";
import WeatherIcon from "@/components/weather/WeatherIcon.vue";
import { useFormatters } from "@/composables/useFormatters";
import { localDate, roundTemp } from "@/utils/format";

const props = defineProps<{ overview: WeatherOverview }>();

const { t } = useI18n();
const fmt = useFormatters();

const today = computed(() =>
  localDate(
    props.overview.current.observedAt,
    props.overview.location.timezoneOffset,
  ),
);

const dayLabel = (d: DailyPoint) =>
  d.date === today.value ? t("weather.today") : fmt.weekday(d.date);

const popPercent = (pop: number) => Math.round(pop * 100);
const popLabel = (pop: number) => `${popPercent(pop)}%`;
</script>

<template>
  <section class="daily-forecast wx-card">
    <div class="daily-title wx-label">{{ t("weather.daily") }}</div>

    <ul class="daily-list">
      <li v-for="d in overview.daily" :key="d.date" class="daily-row">
        <span class="daily-day">{{ dayLabel(d) }}</span>

        <span class="daily-pop">
          <span class="water-drop-wrapper">
            <q-icon
              name="mdi-water-outline"
              size="18px"
              class="drop-base"
              aria-hidden="true"
            />
            <span
              class="drop-fill"
              :style="{ height: `${popPercent(d.pop)}%` }"
            >
              <q-icon name="mdi-water" size="18px" aria-hidden="true" />
            </span>
          </span>
          <span class="pop-text">{{ popLabel(d.pop) }}</span>
        </span>

        <span class="daily-icon">
          <WeatherIcon :condition="d.condition" size="26px" />
        </span>

        <span class="daily-max">{{ roundTemp(d.tempMax) }}°</span>

        <span class="daily-min">{{ roundTemp(d.tempMin) }}°</span>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.daily-forecast {
  padding: 3px clamp(12px, 5vw, 50px) 8px;
}

.daily-title {
  margin: 17px 0 0 0;
  text-align: left;
}

.daily-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.daily-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 70px 38px 38px 36px;
  gap: clamp(6px, 2vw, 10px);
  align-items: center;
  padding: 10px 0;

  & + & {
    border-top: 1px solid var(--divider);
  }
}

.daily-day {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 500;
}

.daily-icon {
  display: flex;
  align-items: center;
  line-height: 1;
}

.daily-pop {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--tone-rain);

  .pop-text {
    flex: 1;
    min-width: 0;
    text-align: left;
    white-space: nowrap;
  }
}

.water-drop-wrapper {
  position: relative;
  width: 18px;
  height: 18px;
  display: inline-block;

  .drop-base {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--tone-cloud);
  }

  .drop-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    pointer-events: none;

    .q-icon {
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }
}

.daily-min,
.daily-max {
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.daily-max {
  text-align: right;
}
</style>
