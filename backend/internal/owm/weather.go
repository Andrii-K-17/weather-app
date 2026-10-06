package owm

import (
	"context"
	"net/url"
)

// Current fetches current weather data for the specified coordinates and language.
func (c *Client) Current(
	ctx context.Context,
	lat, lon float64,
	lang string,
) (CurrentResponse, error) {
	var out CurrentResponse
	err := c.get(ctx, "/data/2.5/weather", weatherParams(lat, lon, lang), &out)
	return out, err
}

// Forecast fetches weather forecast data for the specified coordinates and language.
func (c *Client) Forecast(
	ctx context.Context,
	lat, lon float64,
	lang string,
) (ForecastResponse, error) {
	var out ForecastResponse
	err := c.get(ctx, "/data/2.5/forecast", weatherParams(lat, lon, lang), &out)
	return out, err
}

// weatherParams builds and returns standard URL query parameters.
func weatherParams(lat, lon float64, lang string) url.Values {
	return url.Values{
		"lat":   {formatCoord(lat)},
		"lon":   {formatCoord(lon)},
		"units": {"metric"},
		"lang":  {lang},
	}
}
