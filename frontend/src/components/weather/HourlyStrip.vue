<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Condition, WeatherOverview } from '@/api/types';
import WeatherChart from '@/components/weather/WeatherChart.vue';
import WeatherIcon from '@/components/weather/WeatherIcon.vue';
import { useFormatters } from '@/composables/useFormatters';
import { roundTemp } from '@/utils/format';

interface Slot {
  key: number;
  label: string;
  temp: number;
  condition: Condition;
  pop: number | null;
}

const props = defineProps<{ overview: WeatherOverview }>();

const { t } = useI18n();
const fmt = useFormatters();

const slots = computed<Slot[]>(() => {
  const { current, hourly, location } = props.overview;

  const now: Slot = {
    key: current.observedAt,
    label: t('weather.now'),
    temp: current.temp,
    condition: current.condition,
    pop: null,
  };
  const next = hourly.map<Slot>((h) => ({
    key: h.time,
    label: fmt.hour(h.time, location.timezoneOffset),
    temp: h.temp,
    condition: h.condition,
    pop: h.pop,
  }));
  return [now, ...next];
});

const popLabel = (pop: number | null) => (pop !== null ? `${Math.round(pop * 100)}%` : '-');
const temperatures = computed(() => slots.value.map((slot) => slot.temp));
</script>

<template>
  <section
    class="hourly-strip wx-card"
    :aria-label="t('weather.hourly')"
  >
    <div
      class="hourly-scroll"
      data-no-swipe
      @touchstart.stop
    >
      <div class="hourly-content">
        <div
          class="hourly-row"
          role="list"
        >
          <div
            v-for="(s, i) in slots"
            :key="s.key"
            class="hourly-item"
            role="listitem"
            :aria-label="`${s.label}, ${roundTemp(s.temp)}°, ${popLabel(s.pop)}`"
          >
            <span
              class="hourly-time"
              :class="{ 'hourly-time-now': i === 0 }"
              aria-hidden="true"
            >
              {{ s.label }}
            </span>
            <WeatherIcon
              :condition="s.condition"
              size="28px"
            />
          </div>
        </div>

        <div
          class="hourly-row hourly-temp-row"
          aria-hidden="true"
        >
          <span
            v-for="s in slots"
            :key="s.key"
            class="hourly-temp"
          >
            {{ roundTemp(s.temp) }}°
          </span>
        </div>

        <WeatherChart :temperatures="temperatures" />

        <div
          class="hourly-row hourly-rain-row"
          aria-hidden="true"
        >
          <span
            v-for="s in slots"
            :key="s.key"
            class="hourly-pop"
          >
            {{ popLabel(s.pop) }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hourly-scroll {
  padding: 15px 13px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
    scrollbar-width: none;
  }

  scroll-snap-type: x mandatory;
}

.hourly-temp-row {
  margin: 10px 0 0 0;
}

.hourly-content {
  width: max-content;
  min-width: 100%;
  margin-inline: auto;
}

.hourly-row {
  display: flex;
  gap: 5px;
  width: max-content;
}

.hourly-item {
  display: flex;
  flex: 0 0 60px;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  scroll-snap-align: start;
}

.hourly-time {
  font-size: 14px;
  color: var(--text-muted);
}

.hourly-time-now {
  font-weight: 500;
  color: var(--text);
}

.hourly-rain-row {
  align-items: center;
}

.hourly-temp {
  flex: 0 0 60px;
  text-align: center;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.hourly-pop {
  flex: 0 0 60px;
  text-align: center;
  min-height: 15px;
  font-size: 12px;
  color: var(--tone-rain);
}
</style>
