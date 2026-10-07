package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net"
	"net/http"

	"weatherapp/internal/owm"
)

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		slog.Error("write response", "err", err)
	}
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]apiError{
		"error": {
			Code:    code,
			Message: message,
		},
	},
	)
}

// fail maps errors to HTTP responses.
func (a *api) fail(w http.ResponseWriter, r *http.Request, err error) {
	var netErr net.Error
	switch {
	case errors.Is(err, context.Canceled):
		w.WriteHeader(499) // client closed the request
	case errors.Is(err, owm.ErrNotFound):
		writeError(
			w,
			http.StatusNotFound,
			"not_found",
			"Location not found",
		)
	case errors.Is(err, context.DeadlineExceeded), errors.As(err, &netErr) && netErr.Timeout():
		writeError(
			w,
			http.StatusGatewayTimeout,
			"timeout",
			"Weather provider timed out",
		)
	case errors.Is(err, owm.ErrRateLimited):
		a.log.Warn("owm rate limited", "path", r.URL.Path)
		writeError(
			w,
			http.StatusServiceUnavailable,
			"upstream_busy",
			"Weather provider is busy, try again later",
		)
	default:
		a.log.Error("upstream failure", "path", r.URL.Path, "err", err)
		writeError(
			w,
			http.StatusBadGateway,
			"upstream_error",
			"Weather provider error",
		)
	}
}
