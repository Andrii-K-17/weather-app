import { computed, ref } from 'vue';
import { useCitiesStore } from '@/stores/cities';
import { useWeatherStore, type WeatherTarget } from '@/stores/weather';
import { cityId } from '@/utils/cityId';
import type { FavoriteCity } from '@/utils/favorites';

export type PagerDirection = 'next' | 'prev' | 'none';

const direction = ref<PagerDirection>('none');

export const toTarget = (c: FavoriteCity): WeatherTarget => ({
  lat: c.lat,
  lon: c.lon,
  name: c.name,
});

export function useCityPager() {
  const cities = useCitiesStore();
  const weather = useWeatherStore();

  /** Favorites, preceded by the viewed place if it isn't saved. */
  const pages = computed<WeatherTarget[]>(() => {
    const favorites = cities.items.map(toTarget);
    const current = weather.target;
    if (!current || cities.has(cityId(current.lat, current.lon))) return favorites;
    return [current, ...favorites];
  });

  const isTemporaryFirst = computed(() => pages.value.length > cities.items.length);

  const activeIndex = computed(() => {
    const current = weather.target;
    if (!current) return -1;
    const id = cityId(current.lat, current.lon);
    return pages.value.findIndex((p) => cityId(p.lat, p.lon) === id);
  });

  function goTo(index: number) {
    const page = pages.value[index];
    if (!page || index === activeIndex.value) return;
    direction.value = index > activeIndex.value ? 'next' : 'prev';
    void weather.load(page);
  }

  const go = (delta: 1 | -1) => goTo(activeIndex.value + delta);

  function goToFavorite(city: FavoriteCity) {
    goTo(pages.value.findIndex((p) => cityId(p.lat, p.lon) === city.id));
  }

  const resetDirection = () => {
    direction.value = 'none';
  };

  return {
    pages,
    activeIndex,
    isTemporaryFirst,
    direction,
    go,
    goTo,
    goToFavorite,
    resetDirection,
  };
}
