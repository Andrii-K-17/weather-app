<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Condition, WeatherOverview } from '@/api/types';
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
</script>

<template>
  <section
    class="hourly-strip wx-card"
    :aria-label="t('weather.hourly')"
  >
    <div class="hourly-scroll">
      <div
        v-for="(s, i) in slots"
        :key="s.key"
        class="hourly-item"
      >
        <span
          class="hourly-time"
          :class="{ 'hourly-time-now': i === 0 }"
        >
          {{ s.label }}
        </span>
        <WeatherIcon
          :condition="s.condition"
          size="28px"
        />
        <span class="hourly-temp">{{ roundTemp(s.temp) }}°</span>
        <span class="hourly-pop">{{ popLabel(s.pop) }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hourly-scroll {
  display: flex;
  gap: 5px;
  padding: 15px 13px;
  overflow-x: auto;
  scrollbar-width: none;
  justify-content: center;

  scroll-snap-type: x mandatory;

  &::-webkit-scrollbar {
    display: none;
  }
}

.hourly-item {
  display: flex;
  flex: 0 0 60px;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.hourly-time {
  font-size: 14px;
  color: var(--text-muted);
}

.hourly-time-now {
  font-weight: 500;
  color: var(--text);
}

.hourly-temp {
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.hourly-pop {
  min-height: 15px;
  font-size: 12px;
  color: var(--tone-rain);
}
</style>
