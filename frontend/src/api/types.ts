export interface Condition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezoneOffset: number;
}

export interface CurrentWeather {
  observedAt: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: Condition;
  isDay: boolean;
  humidity: number;
  pressure: number;
  visibility: number;
  clouds: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  sunrise: number;
  sunset: number;
}

export interface HourlyPoint {
  time: number;
  temp: number;
  condition: Condition;
  pop: number;
}

export interface DailyPoint {
  date: string;
  time: number;
  tempMin: number;
  tempMax: number;
  condition: Condition;
  pop: number;
}

export interface WeatherOverview {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  fetchedAt: string;
}

export interface Place {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export type ApiErrorCode =
  | "invalid_request"
  | "not_found"
  | "upstream_busy"
  | "upstream_error"
  | "timeout"
  | "too_many_requests"
  | "internal"
  | "network"
  | "aborted"
  | "unknown";
