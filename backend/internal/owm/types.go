package owm

import "strconv"

type Coord struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type Condition struct {
	ID          int    `json:"id"`
	Main        string `json:"main"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

type MainBlock struct {
	Temp      float64 `json:"temp"`
	FeelsLike float64 `json:"feels_like"`
	TempMin   float64 `json:"temp_min"`
	TempMax   float64 `json:"temp_max"`
	Pressure  int     `json:"pressure"`
	Humidity  int     `json:"humidity"`
}

type WindBlock struct {
	Speed float64 `json:"speed"`
	Deg   int     `json:"deg"`
	Gust  float64 `json:"gust"`
}

type CloudsBlock struct {
	All int `json:"all"`
}

type CurrentSys struct {
	Country string `json:"country"`
	Sunrise int64  `json:"sunrise"`
	Sunset  int64  `json:"sunset"`
}

type CurrentResponse struct {
	Coord      Coord       `json:"coord"`
	Weather    []Condition `json:"weather"`
	Main       MainBlock   `json:"main"`
	Visibility int         `json:"visibility"`
	Wind       WindBlock   `json:"wind"`
	Clouds     CloudsBlock `json:"clouds"`
	Dt         int64       `json:"dt"`
	Sys        CurrentSys  `json:"sys"`
	Timezone   int         `json:"timezone"`
	Name       string      `json:"name"`
}

type ForecastItem struct {
	Dt         int64       `json:"dt"`
	Main       MainBlock   `json:"main"`
	Weather    []Condition `json:"weather"`
	Clouds     CloudsBlock `json:"clouds"`
	Wind       WindBlock   `json:"wind"`
	Visibility int         `json:"visibility"`
	Pop        float64     `json:"pop"`
}

type ForecastCity struct {
	Name     string `json:"name"`
	Country  string `json:"country"`
	Timezone int    `json:"timezone"`
	Sunrise  int64  `json:"sunrise"`
	Sunset   int64  `json:"sunset"`
	Coord    Coord  `json:"coord"`
}

type ForecastResponse struct {
	List []ForecastItem `json:"list"`
	City ForecastCity   `json:"city"`
}

type GeoLocation struct {
	Name       string            `json:"name"`
	LocalNames map[string]string `json:"local_names"`
	Lat        float64           `json:"lat"`
	Lon        float64           `json:"lon"`
	Country    string            `json:"country"`
	State      string            `json:"state"`
}

func formatCoord(v float64) string {
	return strconv.FormatFloat(v, 'f', -1, 64)
}
