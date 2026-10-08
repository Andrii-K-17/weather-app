/** Round a temperature for display; avoids `-0`. */
export function roundTemp(value: number): number {
  const r = Math.round(value);
  return Object.is(r, -0) ? 0 : r;
}

/** Shift a unix timestamp (show city-local time). */
function shifted(unix: number, offsetSec: number): Date {
  return new Date((unix + offsetSec) * 1000);
}

/** City-local calendar date (YYYY-MM-DD). */
export function localDate(unix: number, offsetSec: number): string {
  return shifted(unix, offsetSec).toISOString().slice(0, 10);
}

/** City-local hour. */
export function formatHourLocal(
  unix: number,
  offsetSec: number,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    timeZone: "UTC",
  }).format(shifted(unix, offsetSec));
}

/** Short weekday for a local date string (YYYY-MM-DD). */
export function formatWeekday(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

/** Clock time in the user's own time zone. */
export function formatClock(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
