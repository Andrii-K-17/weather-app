import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useCitiesStore } from '@/stores/cities';
import { useWeatherStore } from '@/stores/weather';
import { cityId } from '@/utils/cityId';
import { makeFavorite, MAX_FAVORITES, type FavoriteCity } from '@/utils/favorites';

export function useFavorites() {
  const $q = useQuasar();
  const { t } = useI18n();
  const cities = useCitiesStore();
  const weather = useWeatherStore();
  const { target, overview, cityName } = storeToRefs(weather);

  const currentId = computed(() =>
    target.value ? cityId(target.value.lat, target.value.lon) : null,
  );
  const isFavorite = computed(() => currentId.value !== null && cities.has(currentId.value));

  function notify(message: string, icon: string, undo?: () => void) {
    $q.notify({
      message,
      icon,
      classes: 'wx-toast',
      timeout: undo ? 5000 : 2500,
      ...(undo ? { actions: [{ label: t('favorites.undo'), color: 'white', handler: undo }] } : {}),
    });
  }

  function remove(city: FavoriteCity) {
    const removed = cities.remove(city.id);
    if (!removed) return;
    notify(t('favorites.removed', { city: removed.city.name }), 'mdi-heart-outline', () =>
      cities.restore(removed.city, removed.index),
    );
  }

  /** Saves the city on screen, or removes it. */
  function toggleCurrent() {
    const o = overview.value;
    const tg = target.value;
    if (!o || !tg) return;

    const existing = cities.items.find((c) => c.id === cityId(tg.lat, tg.lon));
    if (existing) {
      remove(existing);
      return;
    }

    const city = makeFavorite({
      name: cityName.value || o.location.name,
      country: o.location.country,
      lat: tg.lat,
      lon: tg.lon,
    });
    if (cities.add(city) === 'limit') {
      notify(t('favorites.limit', { max: MAX_FAVORITES }), 'mdi-alert-circle-outline');
    } else {
      notify(t('favorites.added', { city: city.name }), 'mdi-heart');
    }
  }

  return {
    isFavorite,
    toggleCurrent,
    remove,
  };
}
