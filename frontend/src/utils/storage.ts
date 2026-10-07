import { LocalStorage } from "quasar";

/**
 * Safe LocalStorage wrapper.
 * Prevents app crashes if storage is full, restricted, or unavailable.
 */
export const storage = {
  get<T>(key: string, guard: (value: unknown) => value is T): T | null {
    try {
      const value: unknown = LocalStorage.getItem(key);
      return guard(value) ? value : null;
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): void {
    try {
      LocalStorage.set(key, value);
    } catch {}
  },

  remove(key: string): void {
    try {
      LocalStorage.remove(key);
    } catch {}
  },
};
