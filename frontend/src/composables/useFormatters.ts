import { useI18n } from 'vue-i18n';
import { formatClock, formatTimeLocal, formatWeekday } from '@/utils/format';

/** Locale-aware formatters bound to the current UI language. */
export function useFormatters() {
  const { locale } = useI18n();

  return {
    updatedAt: (iso: string) => formatClock(new Date(iso), locale.value),
    weekday: (isoDate: string) => {
      const res = formatWeekday(isoDate, locale.value);
      return res.charAt(0).toUpperCase() + res.slice(1);
    },
    number: (value: number, maxFractionDigits = 0) =>
      new Intl.NumberFormat(locale.value, {
        maximumFractionDigits: maxFractionDigits,
      }).format(value),
    time: (unix: number, offsetSec: number) => formatTimeLocal(unix, offsetSec, locale.value),
  };
}
