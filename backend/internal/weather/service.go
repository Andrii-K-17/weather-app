package weather

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"weatherapp/internal/cache"
	"weatherapp/internal/owm"

	"golang.org/x/sync/errgroup"
)

const placeLimit = 5

type Service struct {
	owm      *owm.Client
	overview *cache.TTL[Overview]
	places   *cache.TTL[[]Place]
}

// NewService creates and returns a new weather Service instance initialized with the given OWM client and caches.
func NewService(c *owm.Client) *Service {
	return &Service{
		owm:      c,
		overview: cache.New[Overview](10*time.Minute, 1000),
		places:   cache.New[[]Place](24*time.Hour, 5000),
	}
}

// Overview fetches and merges current weather and forecast data into an overview model, utilizing caching.
func (s *Service) Overview(ctx context.Context, lat, lon float64, lang string) (Overview, error) {
	lat, lon = round2(lat), round2(lon)
	key := fmt.Sprintf("ov|%.2f|%.2f|%s", lat, lon, lang)

	return s.overview.GetOrLoad(ctx, key, func(ctx context.Context) (Overview, error) {
		var (
			cur owm.CurrentResponse
			fc  owm.ForecastResponse
		)
		g, gctx := errgroup.WithContext(ctx)
		g.Go(func() (err error) {
			cur, err = s.owm.Current(gctx, lat, lon, owmLang(lang))
			return
		})
		g.Go(func() (err error) {
			fc, err = s.owm.Forecast(gctx, lat, lon, owmLang(lang))
			return
		})
		if err := g.Wait(); err != nil {
			return Overview{}, err
		}
		return BuildOverview(cur, fc, time.Now()), nil
	})
}

// Search finds places by name. An empty result is not an error.
func (s *Service) Search(ctx context.Context, query, lang string) ([]Place, error) {
	cleanQuery := strings.ReplaceAll(query, "|", " ")
	key := "geo|" + lang + "|" + strings.ToLower(cleanQuery)
	return s.places.GetOrLoad(
		ctx,
		key,
		func(ctx context.Context) ([]Place, error) {
			res, err := s.owm.Geocode(ctx, query, placeLimit)
			if err != nil {
				return nil, err
			}
			return toPlaces(res, lang), nil
		})
}

// Reverse resolves coordinates to place names.
func (s *Service) Reverse(ctx context.Context, lat, lon float64, lang string) ([]Place, error) {
	lat, lon = round2(lat), round2(lon)
	key := fmt.Sprintf("rev|%.2f|%.2f|%s", lat, lon, lang)
	return s.places.GetOrLoad(
		ctx,
		key,
		func(ctx context.Context) ([]Place, error) {
			res, err := s.owm.ReverseGeocode(ctx, lat, lon, 1)
			if err != nil {
				return nil, err
			}
			return toPlaces(res, lang), nil
		})
}

// toPlaces converts OWM geolocation responses into Place models, localizing names where available.
func toPlaces(in []owm.GeoLocation, lang string) []Place {
	out := make([]Place, 0, len(in))
	for _, g := range in {
		name := g.Name
		if lang != "en" {
			if n := g.LocalNames[lang]; n != "" {
				name = n
			}
		}
		out = append(out, Place{
			Name:    name,
			Country: g.Country,
			State:   g.State,
			Lat:     g.Lat,
			Lon:     g.Lon,
		})
	}

	return out
}

func owmLang(lang string) string {
	if lang == "uk" || lang == "ua" {
		return "ua"
	}
	return "en"
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}
