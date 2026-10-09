import { onBeforeUnmount, onMounted } from "vue";

const STALE_AFTER_MS = 10 * 60_000 + 5_000;
const CHECK_EVERY_MS = 60_000;

interface Options {
  refresh: () => unknown;
  lastUpdated: () => number | null;
}

/** Refreshes data when the tab is visible and the data is stale. */
export function useAutoRefresh({ refresh, lastUpdated }: Options) {
  let timer: ReturnType<typeof setInterval> | undefined;
  let lastAttempt = 0;

  function maybeRefresh() {
    if (document.visibilityState !== "visible") return;
    const base = Math.max(lastUpdated() ?? 0, lastAttempt);
    if (Date.now() - base < STALE_AFTER_MS) return;
    lastAttempt = Date.now();
    refresh();
  }

  onMounted(() => {
    timer = setInterval(maybeRefresh, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", maybeRefresh);
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", maybeRefresh);
  });
}
