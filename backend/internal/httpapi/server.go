package httpapi

import (
	"log/slog"
	"net/http"

	"weatherapp/internal/weather"
)

type Deps struct {
	Weather *weather.Service
	Logger  *slog.Logger
}

// New creates and returns a new http.Handler router configured with all API endpoints and dependencies.
func New(d Deps) http.Handler {
	a := &api{
		svc: d.Weather,
		log: d.Logger,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("GET /api/v1/search", a.search)
	mux.HandleFunc("GET /api/v1/reverse", a.reverse)
	mux.HandleFunc("GET /api/v1/weather", a.overview)

	return mux
}
