import type { Place } from '@/api/types';

export interface PlaceLabel {
  title: string;
  subtitle: string;
}

const regionNames = new Map<string, Intl.DisplayNames>();

/** countryName translates a country code into its localized display name. */
export function countryName(code: string, locale: string): string {
  if (!code) return '';
  try {
    let names = regionNames.get(locale);
    if (!names) {
      names = new Intl.DisplayNames([locale], { type: 'region' });
      regionNames.set(locale, names);
    }
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

export function placeLabel(place: Place, locale: string): PlaceLabel {
  const subtitle = [place.state, countryName(place.country, locale)].filter(Boolean).join(', ');
  return { title: place.name, subtitle };
}

/** dedupePlaces filters out duplicate places from a list. */
export function dedupePlaces(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    const key = `${p.name}|${p.state ?? ''}|${p.country}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
