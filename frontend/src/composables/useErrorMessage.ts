import { useI18n } from 'vue-i18n';

/** Returns a function mapping an API error code to a localized message. */
export function useErrorMessage() {
  const { t, te } = useI18n();

  return (code: string | null | undefined): string => {
    const key = `errors.${code ?? 'unknown'}`;
    return te(key) ? t(key) : t('errors.unknown');
  };
}
