import { useQuasar } from "quasar";
import { weatherApi } from "@/api/weather";
import { GeoError, useGeolocation } from "@/composables/useGeolocation";
import { useErrorMessage } from "@/composables/useErrorMessage";
import { useSettingsStore } from "@/stores/settings";
import { useWeatherStore } from "@/stores/weather";

export function useCurrentLocation() {
  const $q = useQuasar();
  const settings = useSettingsStore();
  const weather = useWeatherStore();
  const errorMessage = useErrorMessage();
  const geo = useGeolocation();

  /** Returns false if the position could not be determined. */
  async function locateAndLoad(
    opts: { quiet?: boolean } = {},
  ): Promise<boolean> {
    let coords;
    try {
      coords = await geo.locate();
    } catch (e) {
      if (!opts.quiet) {
        $q.notify({
          message: errorMessage(
            e instanceof GeoError ? e.code : "geo_unavailable",
          ),
          icon: "mdi-crosshairs-off",
          classes: "wx-toast",
        });
      }
      return false;
    }

    // The name is a nicety: weather still loads without it
    const place = await weatherApi
      .reverse(coords.lat, coords.lon, settings.apiLang)
      .catch(() => null);

    const weatherTarget = {
      lat: coords.lat,
      lon: coords.lon,
      ...(typeof place?.name === "string" ? { name: place.name } : {}),
      current: true,
    };

    await weather.load(weatherTarget);
    return true;
  }

  return { ...geo, locateAndLoad };
}
