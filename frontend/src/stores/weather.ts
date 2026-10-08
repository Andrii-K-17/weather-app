import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { ApiError } from "@/api/client";
import { weatherApi } from "@/api/weather";
import type { ApiErrorCode, WeatherOverview } from "@/api/types";
import { useSettingsStore } from "@/stores/settings";
import { getWeatherVisual, type Scene } from "@/utils/weatherVisual";

export interface WeatherTarget {
  lat: number;
  lon: number;
  name?: string;
}

export type WeatherStatus =
  | "idle"
  | "loading"
  | "refreshing"
  | "success"
  | "error";

/**
 * useWeatherStore manages weather overview data, loading states, targets, and asynchronous fetch requests.
 */
export const useWeatherStore = defineStore("weather", () => {
  const settings = useSettingsStore();

  const overview = ref<WeatherOverview | null>(null);
  const status = ref<WeatherStatus>("idle");
  const errorCode = ref<ApiErrorCode | null>(null);
  const target = ref<WeatherTarget | null>(null);
  const scene = ref<Scene>("clear");

  let controller: AbortController | null = null;

  /** cityName returns the resolved name for the current target or overview location. */
  const cityName = computed(
    () => target.value?.name ?? overview.value?.location.name ?? "",
  );

  /**
   * Load weather for a place. A newer call cancels the previous one.
   * silent=true keeps the current data on screen.
   */
  async function load(next: WeatherTarget, opts: { silent?: boolean } = {}) {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    target.value = next;
    errorCode.value = null;

    if (opts.silent && overview.value) {
      status.value = "refreshing";
    } else {
      overview.value = null;
      status.value = "loading";
    }

    try {
      const data = await weatherApi.overview(
        next.lat,
        next.lon,
        settings.apiLang,
        signal,
      );
      if (signal.aborted) return;
      overview.value = data;
      scene.value = getWeatherVisual(
        data.current.condition.id,
        data.current.isDay,
      ).scene;
      status.value = "success";
    } catch (e) {
      if (signal.aborted) return;
      errorCode.value = e instanceof ApiError ? e.code : "unknown";
      status.value = "error";
    }
  }

  /** refresh reloads weather data for the current target location silently if a target is set. */
  function refresh() {
    return target.value
      ? load(target.value, { silent: true })
      : Promise.resolve();
  }

  return {
    overview,
    status,
    errorCode,
    target,
    cityName,
    scene,
    load,
    refresh,
  };
});
