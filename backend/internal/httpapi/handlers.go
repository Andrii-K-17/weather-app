package httpapi

import (
	"errors"
	"log/slog"
	"math"
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"weatherapp/internal/owm"
	"weatherapp/internal/weather"
)

type api struct {
	svc *weather.Service
	log *slog.Logger
}

// health handles liveness check requests.
func (a *api) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// GET /api/v1/search?q=Kyiv&lang=uk
// search handles location search requests by query string and returns matching places.
func (a *api) search(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if n := utf8.RuneCountInString(q); n < 2 || n > 100 {
		writeError(w, http.StatusBadRequest, "invalid_request", "q must be 2-100 characters")
		return
	}

	places, err := a.svc.Search(r.Context(), q, parseLang(r))
	if err != nil {
		a.fail(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"results": places})
}

// GET /api/v1/reverse?lat=50.45&lon=30.52&lang=uk
// reverse handles reverse geocoding requests to resolve coordinates into a place name.
func (a *api) reverse(w http.ResponseWriter, r *http.Request) {
	lat, lon, err := parseCoords(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	places, err := a.svc.Reverse(r.Context(), lat, lon, parseLang(r))
	if err != nil {
		a.fail(w, r, err)
		return
	}
	if len(places) == 0 {
		a.fail(w, r, owm.ErrNotFound)
		return
	}

	writeJSON(w, http.StatusOK, places[0])
}

// GET /api/v1/weather?lat=50.45&lon=30.52&lang=uk
// overview handles weather overview requests for specific coordinates.
func (a *api) overview(w http.ResponseWriter, r *http.Request) {
	lat, lon, err := parseCoords(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}

	ov, err := a.svc.Overview(r.Context(), lat, lon, parseLang(r))
	if err != nil {
		a.fail(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, ov)
}

func parseLang(r *http.Request) string {
	if r.URL.Query().Get("lang") == "uk" {
		return "uk"
	}
	return "en"
}

// parseCoords parses and validates latitude and longitude query parameters from the HTTP request.
func parseCoords(r *http.Request) (lat, lon float64, err error) {
	q := r.URL.Query()

	lat, err = strconv.ParseFloat(q.Get("lat"), 64)
	if err != nil || math.IsNaN(lat) || lat < -90 || lat > 90 {
		return 0, 0, errors.New("lat must be a number between -90 and 90")
	}

	lon, err = strconv.ParseFloat(q.Get("lon"), 64)
	if err != nil || math.IsNaN(lon) || lon < -180 || lon > 180 {
		return 0, 0, errors.New("lon must be a number between -180 and 180")
	}

	return lat, lon, nil
}
