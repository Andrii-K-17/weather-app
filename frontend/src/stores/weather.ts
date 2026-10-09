import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { ApiError } from "@/api/client";
import { weatherApi } from "@/api/weather";
import type { ApiErrorCode, WeatherOverview } from "@/api/types";
import { useSettingsStore } from "@/stores/settings";
import { storage } from "@/utils/storage";
import { getWeatherVisual, type Scene } from "@/utils/weatherVisual";

export interface WeatherTarget {
  lat: number;
  lon: number;
  name?: string;
  current?: boolean;
}

export type WeatherStatus =
  | "idle"
  | "loading"
  | "refreshing"
  | "success"
  | "error";

const LAST_TARGET_KEY = "wx:v1:last-target";

/** Validates whether an unknown value is a valid weather target object. */
const isTarget = (v: unknown): v is WeatherTarget => {
  if (typeof v !== "object" || v === null) return false;
  const t = v as Partial<WeatherTarget>;
  return (
    typeof t.lat === "number" &&
    typeof t.lon === "number" &&
    Math.abs(t.lat) <= 90 &&
    Math.abs(t.lon) <= 180
  );
};

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

  /** The last successfully viewed place. */
  function savedTarget(): WeatherTarget | null {
    return storage.get(LAST_TARGET_KEY, isTarget);
  }

  /**
   * Load weather for a place. A newer call cancels the previous one.
   * silent: keep the current data on screen (auto-refresh).
   * persist: remember the place for the next launch.
   */
  async function load(
    next: WeatherTarget,
    opts: { silent?: boolean; persist?: boolean } = {},
  ) {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    const previous = { overview: overview.value, target: target.value };

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

      if (opts.persist !== false) storage.set(LAST_TARGET_KEY, next);
    } catch (e) {
      if (signal.aborted) return;
      errorCode.value = e instanceof ApiError ? e.code : "unknown";

      if (!overview.value && previous.overview) {
        overview.value = previous.overview;
        target.value = previous.target;
      }
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
    savedTarget,
    load,
    refresh,
  };
});
