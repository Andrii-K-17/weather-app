import { apiGet } from "./client";
import type { Place, WeatherOverview } from "./types";

export const weatherApi = {
  /**
   * overview fetches current weather and forecast data
   * for the specified geographical coordinates and language.
   */
  overview(lat: number, lon: number, lang: string, signal?: AbortSignal) {
    return apiGet<WeatherOverview>("/weather", { lat, lon, lang }, signal);
  },

  /** search queries the API for places matching the given search string and language. */
  async search(
    q: string,
    lang: string,
    signal?: AbortSignal,
  ): Promise<Place[]> {
    const res = await apiGet<{ results: Place[] }>(
      "/search",
      { q, lang },
      signal,
    );
    return res.results;
  },

  /** reverse resolves geographical coordinates into a matching place name and details. */
  reverse(lat: number, lon: number, lang: string, signal?: AbortSignal) {
    return apiGet<Place>("/reverse", { lat, lon, lang }, signal);
  },
};
