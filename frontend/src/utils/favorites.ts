import { cityId, round2 } from './cityId';

export interface FavoriteCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const MAX_FAVORITES = 10;
export type AddResult = 'added' | 'exists' | 'limit';

export function makeFavorite(input: {
  name: string;
  country?: string;
  lat: number;
  lon: number;
}): FavoriteCity {
  // Precise GPS positions are never stored
  const lat = round2(input.lat);
  const lon = round2(input.lon);
  return {
    id: cityId(lat, lon),
    name: input.name.trim(),
    country: input.country ?? '',
    lat,
    lon,
  };
}

/** Safely parses and validates the favorite cities list from an untrusted source. */
export function parseFavorites(raw: unknown): FavoriteCity[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const { version, items } = raw as { version?: unknown; items?: unknown };
  if (version !== 1 || !Array.isArray(items)) return [];

  const out: FavoriteCity[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue;
    const { name, country, lat, lon } = item as Record<string, unknown>;

    if (typeof name !== 'string' || name.trim() === '') continue;
    if (typeof lat !== 'number' || typeof lon !== 'number') continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;

    const fav = makeFavorite({
      name,
      country: typeof country === 'string' ? country : '',
      lat,
      lon,
    });

    if (seen.has(fav.id)) continue;
    seen.add(fav.id);
    out.push(fav);
    if (out.length === MAX_FAVORITES) break;
  }

  return out;
}

export function addFavorite(
  list: FavoriteCity[],
  city: FavoriteCity,
  max = MAX_FAVORITES,
): {
  list: FavoriteCity[];
  result: AddResult;
} {
  if (list.some((c) => c.id === city.id)) return { list, result: 'exists' };
  if (list.length >= max) return { list, result: 'limit' };

  return {
    list: [...list, city],
    result: 'added',
  };
}

export function removeFavorite(
  list: FavoriteCity[],
  id: string,
): {
  list: FavoriteCity[];
  removed: {
    city: FavoriteCity;
    index: number;
  } | null;
} {
  const index = list.findIndex((c) => c.id === id);
  const city = list[index];
  if (!city) return { list, removed: null };

  return {
    list: list.filter((c) => c.id !== id),
    removed: { city, index },
  };
}

/** Puts a city back at its old position. */
export function insertFavorite(
  list: FavoriteCity[],
  city: FavoriteCity,
  index: number,
  max = MAX_FAVORITES,
): FavoriteCity[] {
  if (list.some((c) => c.id === city.id) || list.length >= max) return list;
  const next = [...list];
  next.splice(Math.min(Math.max(index, 0), next.length), 0, city);
  return next;
}
