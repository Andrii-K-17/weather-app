package owm

import (
	"context"
	"net/url"
	"strconv"
)

// Geocode finds locations by name.
func (c *Client) Geocode(ctx context.Context, query string, limit int) ([]GeoLocation, error) {
	var out []GeoLocation
	err := c.get(ctx, "/geo/1.0/direct", url.Values{
		"q":     {query},
		"limit": {strconv.Itoa(limit)},
	}, &out)
	return out, err
}

// ReverseGeocode finds location names by coordinates.
func (c *Client) ReverseGeocode(
	ctx context.Context,
	lat, lon float64,
	limit int,
) ([]GeoLocation, error) {
	var out []GeoLocation
	err := c.get(ctx, "/geo/1.0/reverse", url.Values{
		"lat":   {formatCoord(lat)},
		"lon":   {formatCoord(lon)},
		"limit": {strconv.Itoa(limit)},
	}, &out)
	return out, err
}
