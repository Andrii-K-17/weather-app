package httpapi

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"net"
	"net/http"
	"runtime/debug"
	"strings"
	"time"
)

type middleware func(http.Handler) http.Handler

// chain applies middlewares so that the first one is the outermost.
func chain(h http.Handler, mws ...middleware) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

// requestID injects X-Request-ID header into the request and response for tracing.
func requestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var b [8]byte
		_, _ = rand.Read(b[:])
		w.Header().Set("X-Request-ID", hex.EncodeToString(b[:]))
		next.ServeHTTP(w, r)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

// WriteHeader records the HTTP status code and delegates to the underlying ResponseWriter.
func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

// Unwrap returns the underlying ResponseWriter.
func (r *statusRecorder) Unwrap() http.ResponseWriter {
	return r.ResponseWriter
}

// logging returns a middleware that logs request details.
func logging(log *slog.Logger) middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rec, r)
			log.Info("request",
				"id", w.Header().Get("X-Request-ID"),
				"method", r.Method,
				"path", r.URL.Path,
				"status", rec.status,
				"ms", time.Since(start).Milliseconds(),
			)
		})
	}
}

// recoverer returns a middleware that recovers from panics, logs the stack trace,
// and returns an internal server error response.
func recoverer(log *slog.Logger) middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					if rec == http.ErrAbortHandler {
						panic(rec)
					}
					log.Error("panic", "err", rec, "stack", string(debug.Stack()))
					writeError(w,
						http.StatusInternalServerError,
						"internal",
						"Internal server error",
					)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// cors returns a middleware that handles Cross-Origin Resource Sharing headers for allowed origins.
func cors(allowed []string) middleware {
	set := make(map[string]struct{}, len(allowed))
	for _, o := range allowed {
		set[o] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if origin := r.Header.Get("Origin"); origin != "" {
				if _, ok := set[origin]; ok {
					h := w.Header()
					h.Set("Access-Control-Allow-Origin", origin)
					h.Add("Vary", "Origin")
					h.Set("Access-Control-Allow-Methods", "GET, OPTIONS")
					h.Set("Access-Control-Allow-Headers", "Content-Type")
					h.Set("Access-Control-Max-Age", "600")
				}
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// rateLimit returns a middleware that restricts request rates per client IP address.
func rateLimit(l *ipLimiter) middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, "/api/") && !l.allow(clientIP(r)) {
				w.Header().Set("Retry-After", "1")
				writeError(w,
					http.StatusTooManyRequests,
					"too_many_requests",
					"Too many requests",
				)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// timeout returns a middleware that sets a strict execution timeout on the request context.
func timeout(d time.Duration) middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, cancel := context.WithTimeout(r.Context(), d)
			defer cancel()
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// clientIP extracts and returns the client IP address from the remote network address.
func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
