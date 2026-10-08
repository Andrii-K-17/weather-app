<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import AppTopBar from "@/components/AppTopBar.vue";
import HomeSkeleton from "@/components/weather/HomeSkeleton.vue";
import { useErrorMessage } from "@/composables/useErrorMessage";
import { useWeatherStore } from "@/stores/weather";
import { roundTemp } from "@/utils/format";

const { t } = useI18n();
const errorMessage = useErrorMessage();

const weather = useWeatherStore();
const { overview, status, errorCode, cityName } = storeToRefs(weather);

// Temporary default
const DEFAULT_CITY = { name: "Kyiv", lat: 50.45, lon: 30.52 };

const showSkeleton = computed(
  () => !overview.value && status.value !== "error",
);

onMounted(() => {
  if (!weather.overview) void weather.load(DEFAULT_CITY);
});
</script>

<template>
  <q-page>
    <div class="wx-container">
      <AppTopBar />

      <HomeSkeleton v-if="showSkeleton" />

      <div v-else-if="!overview" class="state wx-card">
        <q-icon name="mdi-cloud-off-outline" size="40px" class="wx-muted" />
        <p class="state__text">{{ errorMessage(errorCode) }}</p>
        <q-btn
          flat
          rounded
          no-caps
          :label="t('common.retry')"
          @click="weather.refresh()"
        />
      </div>

      <section v-else class="hero">
        <div class="hero__city">{{ cityName }}</div>
        <div class="wx-temp">{{ roundTemp(overview.current.temp) }}°</div>
        <div class="hero__desc">
          {{ overview.current.condition.description }}
        </div>
        <div class="wx-muted">
          {{ t("weather.high") }} {{ roundTemp(overview.current.tempMax) }}° ·
          {{ t("weather.low") }} {{ roundTemp(overview.current.tempMin) }}°
        </div>
      </section>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 28px;
  text-align: center;
}

.hero__city {
  font-size: 22px;
  font-weight: 400;
}

.hero__desc {
  margin: 4px 0;
  font-size: 18px;
  text-transform: capitalize;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
  padding: 32px 24px;
  text-align: center;
}

.state__text {
  margin: 0;
  color: var(--text-muted);
}
</style>
