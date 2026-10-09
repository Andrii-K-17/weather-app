import { onBeforeUnmount, ref, watch } from "vue";
import { ApiError } from "@/api/client";
import { weatherApi } from "@/api/weather";
import type { ApiErrorCode, Place } from "@/api/types";
import { useSettingsStore } from "@/stores/settings";
import { dedupePlaces } from "@/utils/place";

export type SearchStatus = "idle" | "loading" | "done" | "error";

const MIN_QUERY_LENGTH = 2;

export function useCitySearch() {
  const settings = useSettingsStore();

  const query = ref<string | null>("");
  const results = ref<Place[]>([]);
  const status = ref<SearchStatus>("idle");
  const errorCode = ref<ApiErrorCode | null>(null);

  let controller: AbortController | null = null;

  async function run() {
    controller?.abort();

    const q = (query.value ?? "").trim();
    if (q.length < MIN_QUERY_LENGTH) {
      results.value = [];
      errorCode.value = null;
      status.value = "idle";
      return;
    }

    controller = new AbortController();
    const { signal } = controller;
    status.value = "loading";
    errorCode.value = null;

    try {
      const places = await weatherApi.search(q, settings.apiLang, signal);
      if (signal.aborted) return;
      results.value = dedupePlaces(places);
      status.value = "done";
    } catch (e) {
      if (signal.aborted) return;
      errorCode.value = e instanceof ApiError ? e.code : "unknown";
      status.value = "error";
    }
  }

  watch(query, () => void run());
  onBeforeUnmount(() => controller?.abort());

  function reset() {
    controller?.abort();
    query.value = "";
    results.value = [];
    errorCode.value = null;
    status.value = "idle";
  }

  return {
    query,
    results,
    status,
    errorCode,
    retry: run,
    reset,
  };
}
