import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import {
  addFavorite,
  insertFavorite,
  MAX_FAVORITES,
  parseFavorites,
  removeFavorite,
  type AddResult,
  type FavoriteCity,
} from '@/utils/favorites';
import { storage } from '@/utils/storage';

const FAVORITES_KEY = 'wx:favorites';
const LEGACY_FAVORITES_KEY = 'wx:v1:favorites';

export const useCitiesStore = defineStore('cities', () => {
  const storedItems = storage.getRaw(FAVORITES_KEY);
  const legacyItems = storage.getRaw(LEGACY_FAVORITES_KEY);
  const items = ref<FavoriteCity[]>(parseFavorites(storedItems ?? legacyItems));

  if (storedItems == null && legacyItems != null) {
    storage.set(FAVORITES_KEY, items.value);
  }

  const isFull = computed(() => items.value.length >= MAX_FAVORITES);

  watch(items, (list) => storage.set(FAVORITES_KEY, list), { deep: true });

  const has = (id: string) => items.value.some((c) => c.id === id);

  function add(city: FavoriteCity): AddResult {
    const { list, result } = addFavorite(items.value, city);
    items.value = list;
    return result;
  }

  function remove(id: string) {
    const { list, removed } = removeFavorite(items.value, id);
    items.value = list;
    return removed;
  }

  function restore(city: FavoriteCity, index: number) {
    items.value = insertFavorite(items.value, city, index);
  }

  return { items, isFull, has, add, remove, restore };
});
