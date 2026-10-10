import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { storage } from '@/utils/storage';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLocale = 'en-US' | 'uk';

const THEME_KEY = 'wx:v1:theme';
const LANG_KEY = 'wx:v1:lang';
const THEME_ORDER: ThemeMode[] = ['system', 'light', 'dark'];

/** isTheme checks whether an unknown value is a valid ThemeMode. */
const isTheme = (v: unknown): v is ThemeMode => v === 'system' || v === 'light' || v === 'dark';

/** isLocale checks whether an unknown value is a valid AppLocale. */
const isLocale = (v: unknown): v is AppLocale => v === 'en-US' || v === 'uk';

/** useSettingsStore manages application theme preferences and localization settings. */
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeMode>(storage.get(THEME_KEY, isTheme) ?? 'system');
  const language = ref<AppLocale>(storage.get(LANG_KEY, isLocale) ?? 'en-US');

  /** apiLang returns the normalized language code for backend API requests. */
  const apiLang = computed(() => (language.value === 'uk' ? 'uk' : 'en'));

  watch(
    theme,
    (mode) => {
      Dark.set(mode === 'system' ? 'auto' : mode === 'dark');
      storage.set(THEME_KEY, mode);
    },
    { immediate: true },
  );

  watch(language, (lang) => storage.set(LANG_KEY, lang));

  /** setTheme updates and persists the current application theme mode. */
  function setTheme(mode: ThemeMode) {
    theme.value = mode;
  }

  /** cycleTheme rotates to the next available theme mode in sequence. */
  function cycleTheme() {
    const next = (THEME_ORDER.indexOf(theme.value) + 1) % THEME_ORDER.length;
    theme.value = THEME_ORDER[next] ?? 'system';
  }

  return {
    theme,
    language,
    apiLang,
    setTheme,
    cycleTheme,
  };
});
