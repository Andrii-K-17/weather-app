package httpapi

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"weatherapp/internal/weather"
)

type Deps struct {
	Weather        *weather.Service
	Logger         *slog.Logger
	AllowedOrigins []string
}

// New creates and returns a new http.Handler router configured with all API endpoints and dependencies.
func New(ctx context.Context, d Deps) http.Handler {
	a := &api{svc: d.Weather, log: d.Logger}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("GET /api/v1/search", a.search)
	mux.HandleFunc("GET /api/v1/reverse", a.reverse)
	mux.HandleFunc("GET /api/v1/weather", a.overview)

	limiter := newIPLimiter(10, 30)
	go limiter.cleanup(ctx, time.Minute, 5*time.Minute)

	return chain(mux,
		requestID,
		logging(d.Logger),
		recoverer(d.Logger),
		cors(d.AllowedOrigins),
		rateLimit(limiter),
		timeout(5*time.Second),
	)
}
