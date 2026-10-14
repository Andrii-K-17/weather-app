import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { ApiError } from '@/api/client';
import { weatherApi } from '@/api/weather';
import type { ApiErrorCode, WeatherOverview } from '@/api/types';
import { useSettingsStore } from '@/stores/settings';
import { cityId } from '@/utils/cityId';
import { storage } from '@/utils/storage';
import { getWeatherVisual, type Scene } from '@/utils/weatherVisual';

export interface WeatherTarget {
  lat: number;
  lon: number;
  name?: string;
  current?: boolean;
}

export type WeatherStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error';

interface LoadOptions {
  silent?: boolean;
  persist?: boolean;
}

interface Snapshot {
  overview: WeatherOverview;
  receivedAt: number;
}

const LAST_TARGET_KEY = 'wx:v1:last-target';
const FRESH_MS = 2 * 60_000;
const MAX_SNAPSHOTS = 20;
const PREFETCH_CONCURRENCY = 3;

/** Validates whether an unknown value is a valid weather target object. */
const isTarget = (v: unknown): v is WeatherTarget => {
  if (typeof v !== 'object' || v === null) return false;
  const t = v as Partial<WeatherTarget>;
  return (
    typeof t.lat === 'number' &&
    typeof t.lon === 'number' &&
    Math.abs(t.lat) <= 90 &&
    Math.abs(t.lon) <= 180
  );
};

/** Maps the current condition to the matching scene for the UI. */
const sceneOf = (o: WeatherOverview): Scene =>
  getWeatherVisual(o.current.condition.id, o.current.isDay).scene;

export const useWeatherStore = defineStore('weather', () => {
  const settings = useSettingsStore();

  const overview = ref<WeatherOverview | null>(null);
  const status = ref<WeatherStatus>('idle');
  const errorCode = ref<ApiErrorCode | null>(null);
  const target = ref<WeatherTarget | null>(null);
  const scene = ref<Scene>('clear');

  const snapshots = ref<Record<string, Snapshot>>({});

  /** Cancels stale requests when the user switches cities quickly. */
  let controller: AbortController | null = null;

  /** cityName returns the resolved name for the current target or overview location. */
  const cityName = computed(() => target.value?.name ?? overview.value?.location.name ?? '');

  watch(
    () => settings.apiLang,
    () => {
      snapshots.value = {};
    },
  );

  /** Store the newest weather payloads per location and trim the oldest ones. */
  function putSnapshot(t: WeatherTarget, data: WeatherOverview) {
    const all = {
      ...snapshots.value,
      [cityId(t.lat, t.lon)]: { overview: data, receivedAt: Date.now() },
    };
    snapshots.value = Object.fromEntries(
      Object.entries(all)
        .sort((a, b) => b[1].receivedAt - a[1].receivedAt)
        .slice(0, MAX_SNAPSHOTS),
    );
  }

  function snapshot(lat: number, lon: number): WeatherOverview | null {
    return snapshots.value[cityId(lat, lon)]?.overview ?? null;
  }

  /** Restores the last selected target from storage. */
  function savedTarget(): WeatherTarget | null {
    return storage.get(LAST_TARGET_KEY, isTarget);
  }

  function remember(next: WeatherTarget, opts: LoadOptions) {
    if (opts.persist !== false) storage.set(LAST_TARGET_KEY, next);
  }

  /** Fetches weather for a target and cancels any older in-flight request. */
  async function load(next: WeatherTarget, opts: LoadOptions = {}) {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    const cached = snapshots.value[cityId(next.lat, next.lon)];
    const previous = { overview: overview.value, target: target.value };

    target.value = next;
    errorCode.value = null;

    if (opts.silent && overview.value) {
      status.value = 'refreshing';
    } else if (cached) {
      overview.value = cached.overview;
      scene.value = sceneOf(cached.overview);
      if (Date.now() - cached.receivedAt < FRESH_MS) {
        status.value = 'success';
        remember(next, opts);
        return;
      }
      status.value = 'refreshing';
    } else {
      overview.value = null;
      status.value = 'loading';
    }

    try {
      const data = await weatherApi.overview(next.lat, next.lon, settings.apiLang, signal);
      if (signal.aborted) return;
      overview.value = data;
      scene.value = sceneOf(data);
      putSnapshot(next, data);
      status.value = 'success';
      remember(next, opts);
    } catch (e) {
      if (signal.aborted) return;
      errorCode.value = e instanceof ApiError ? e.code : 'unknown';
      if (!overview.value && previous.overview) {
        overview.value = previous.overview;
        target.value = previous.target;
      }
      status.value = 'error';
    }
  }

  /** refresh reloads weather data for the current target location silently if a target is set. */
  function refresh() {
    return target.value ? load(target.value, { silent: true }) : Promise.resolve();
  }

  /** Prefetches several nearby places with a limited concurrency to avoid blocking the app. */
  async function prefetch(targets: WeatherTarget[]) {
    const queue = targets.filter((t) => {
      const s = snapshots.value[cityId(t.lat, t.lon)];
      return !s || Date.now() - s.receivedAt >= FRESH_MS;
    });

    const worker = async () => {
      for (let t = queue.shift(); t; t = queue.shift()) {
        try {
          putSnapshot(t, await weatherApi.overview(t.lat, t.lon, settings.apiLang));
        } catch {
          // the city row simply stays without a mini forecast
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(PREFETCH_CONCURRENCY, queue.length) }, worker));
  }

  return {
    overview,
    status,
    errorCode,
    target,
    cityName,
    scene,
    snapshot,
    savedTarget,
    load,
    refresh,
    prefetch,
  };
});
