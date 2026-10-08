import { useI18n } from "vue-i18n";
import { formatClock, formatHourLocal, formatWeekday } from "@/utils/format";

/** Locale-aware formatters bound to the current UI language. */
export function useFormatters() {
  const { locale } = useI18n();

  return {
    updatedAt: (iso: string) => formatClock(new Date(iso), locale.value),
    hour: (unix: number, offsetSec: number) =>
      formatHourLocal(unix, offsetSec, locale.value),
    weekday: (isoDate: string) => formatWeekday(isoDate, locale.value),
    number: (value: number, maxFractionDigits = 0) =>
      new Intl.NumberFormat(locale.value, {
        maximumFractionDigits: maxFractionDigits,
      }).format(value),
  };
}
