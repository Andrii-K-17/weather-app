package owm

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestErrStatusMapping(t *testing.T) {
	cases := map[int]error{
		http.StatusNotFound:            ErrNotFound,
		http.StatusUnauthorized:        ErrUnauthorized,
		http.StatusTooManyRequests:     ErrRateLimited,
		http.StatusInternalServerError: ErrUpstream,
	}
	for status, want := range cases {
		t.Run(http.StatusText(status), func(t *testing.T) {
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(status)
			}))
			defer srv.Close()

			c := NewClient("k", WithBaseURL(srv.URL))
			_, err := c.Current(context.Background(), 50, 30, "en")
			if !errors.Is(err, want) {
				t.Fatalf("err = %v, want %v", err, want)
			}
		})
	}
}

func TestClientDoesNotLeakAPIKey(t *testing.T) {
	srv := httptest.NewServer(http.NotFoundHandler())
	srv.Close()

	c := NewClient("key", WithBaseURL(srv.URL))
	_, err := c.Current(context.Background(), 50, 30, "en")
	if err == nil {
		t.Fatal("expected an error")
	}
	if strings.Contains(err.Error(), "key") {
		t.Fatalf("error leaks the API key: %v", err)
	}
	if !errors.Is(err, ErrUpstream) {
		t.Fatalf("err = %v, want ErrUpstream", err)
	}
}
