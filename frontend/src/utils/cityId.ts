export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Coordinates rounded to ~1 km. */
export function cityId(lat: number, lon: number): string {
  return `${round2(lat).toFixed(2)},${round2(lon).toFixed(2)}`;
}
