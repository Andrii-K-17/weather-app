export type Tone = 'sun' | 'moon' | 'cloud' | 'rain' | 'storm' | 'snow' | 'mist';

export type Scene = 'clear' | 'night' | 'clouds' | 'rain' | 'storm' | 'snow' | 'mist';

export interface WeatherVisual {
  icon: string;
  tone: Tone;
  scene: Scene;
}

const v = (icon: string, tone: Tone, scene: Scene): WeatherVisual => ({
  icon,
  tone,
  scene,
});

export function isDayIcon(icon: string): boolean {
  return !icon.endsWith('n');
}

/** Maps an OWM condition id to an MDI icon, tone and sky scene. */
export function getWeatherVisual(id: number, isDay: boolean): WeatherVisual {
  // 2xx thunderstorm
  if (id >= 200 && id < 300) {
    const withRain = id < 210 || id >= 230;
    return v(withRain ? 'mdi-weather-lightning-rainy' : 'mdi-weather-lightning', 'storm', 'storm');
  }

  // 3xx drizzle
  if (id >= 300 && id < 400) return v('mdi-weather-rainy', 'rain', 'rain');

  // 5xx rain
  if (id >= 500 && id < 600) {
    if (id === 511) return v('mdi-weather-snowy-rainy', 'rain', 'rain'); // freezing rain
    if (id === 500 || id === 520) return v('mdi-weather-rainy', 'rain', 'rain');
    return v('mdi-weather-pouring', 'rain', 'rain');
  }

  // 6xx snow
  if (id >= 600 && id < 700) {
    if (id >= 611 && id <= 616) return v('mdi-weather-snowy-rainy', 'snow', 'snow'); // sleet
    if (id === 602 || id === 622) return v('mdi-weather-snowy-heavy', 'snow', 'snow');
    return v('mdi-weather-snowy', 'snow', 'snow');
  }

  // 7xx atmosphere
  if (id >= 700 && id < 800) {
    if (id === 781) return v('mdi-weather-tornado', 'mist', 'mist');
    if (id === 771) return v('mdi-weather-windy', 'mist', 'mist');
    if ([711, 721, 731, 751, 761, 762].includes(id)) return v('mdi-weather-hazy', 'mist', 'mist');
    return v('mdi-weather-fog', 'mist', 'mist');
  }

  // 800 clear
  if (id === 800) {
    return isDay ? v('mdi-weather-sunny', 'sun', 'clear') : v('mdi-weather-night', 'moon', 'night');
  }

  // 801 few clouds, 802 scattered clouds
  if (id === 801) {
    return isDay
      ? v('mdi-weather-partly-cloudy', 'sun', 'clear')
      : v('mdi-weather-night-partly-cloudy', 'moon', 'night');
  }
  if (id === 802) {
    return isDay
      ? v('mdi-weather-partly-cloudy', 'cloud', 'clear')
      : v('mdi-weather-night-partly-cloudy', 'cloud', 'night');
  }

  return v('mdi-weather-cloudy', 'cloud', isDay ? 'clouds' : 'night');
}
