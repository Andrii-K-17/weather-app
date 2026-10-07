package weather

import "time"

// Overview is the single payload the frontend needs for a city screen.
type Overview struct {
	Location  Location      `json:"location"`
	Current   Current       `json:"current"`
	Hourly    []HourlyPoint `json:"hourly"`
	Daily     []DailyPoint  `json:"daily"`
	FetchedAt time.Time     `json:"fetchedAt"`
}

type Location struct {
	Name           string  `json:"name"`
	Country        string  `json:"country"`
	Lat            float64 `json:"lat"`
	Lon            float64 `json:"lon"`
	TimezoneOffset int     `json:"timezoneOffset"`
}

type Condition struct {
	ID          int    `json:"id"`
	Main        string `json:"main"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

type Current struct {
	ObservedAt int64     `json:"observedAt"`
	Temp       float64   `json:"temp"`
	FeelsLike  float64   `json:"feelsLike"`
	TempMin    float64   `json:"tempMin"`
	TempMax    float64   `json:"tempMax"`
	Condition  Condition `json:"condition"`
	IsDay      bool      `json:"isDay"`
	Humidity   int       `json:"humidity"`
	Pressure   int       `json:"pressure"`
	Visibility int       `json:"visibility"`
	Clouds     int       `json:"clouds"`
	WindSpeed  float64   `json:"windSpeed"`
	WindDeg    int       `json:"windDeg"`
	WindGust   float64   `json:"windGust,omitempty"`
	Sunrise    int64     `json:"sunrise"`
	Sunset     int64     `json:"sunset"`
}

type HourlyPoint struct {
	Time      int64     `json:"time"`
	Temp      float64   `json:"temp"`
	Condition Condition `json:"condition"`
	Pop       float64   `json:"pop"`
}

type DailyPoint struct {
	Date      string    `json:"date"`
	Time      int64     `json:"time"`
	TempMin   float64   `json:"tempMin"`
	TempMax   float64   `json:"tempMax"`
	Condition Condition `json:"condition"`
	Pop       float64   `json:"pop"`
}

// Place is a geocoding result.
type Place struct {
	Name    string  `json:"name"`
	Country string  `json:"country"`
	State   string  `json:"state,omitempty"`
	Lat     float64 `json:"lat"`
	Lon     float64 `json:"lon"`
}
