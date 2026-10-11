package owm

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// ErrNotFound indicates the requested weather data is missing.
var (
	ErrNotFound     = errors.New("owm: not found")
	ErrUnauthorized = errors.New("owm: invalid API key")
	ErrRateLimited  = errors.New("owm: rate limited")
	ErrUpstream     = errors.New("owm: upstream error")
)

const defaultBaseURL = "https://api.openweathermap.org"

// Client is a thin OpenWeatherMap API client with custom base URL and HTTP options.
type Client struct {
	apiKey  string
	baseURL string
	http    *http.Client
}

// Option configures a Client during creation.
type Option func(*Client)

// WithBaseURL overrides the API base URL used by the client.
func WithBaseURL(u string) Option {
	return func(c *Client) { c.baseURL = u }
}

// WithHTTPClient sets a custom HTTP client for requests.
func WithHTTPClient(h *http.Client) Option {
	return func(c *Client) { c.http = h }
}

// NewClient creates a new OpenWeatherMap client using the provided API key.
func NewClient(apiKey string, opts ...Option) *Client {
	c := &Client{
		apiKey:  apiKey,
		baseURL: defaultBaseURL,
		http:    &http.Client{Timeout: 8 * time.Second},
	}
	for _, o := range opts {
		o(c)
	}
	return c
}

// get performs a GET request and decodes the JSON response into out.
func (c *Client) get(ctx context.Context, path string, params url.Values, out any) error {
	q := url.Values{}
	for k, v := range params {
		q[k] = v
	}
	q.Set("appid", c.apiKey)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path+"?"+q.Encode(), nil)
	if err != nil {
		return fmt.Errorf("%w: build request", ErrUpstream)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		var ue *url.Error
		if errors.As(err, &ue) {
			err = ue.Err
		}
		return fmt.Errorf("%w: %w", ErrUpstream, err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
	case http.StatusNotFound:
		return ErrNotFound
	case http.StatusUnauthorized:
		return ErrUnauthorized
	case http.StatusTooManyRequests:
		return ErrRateLimited
	default:
		return fmt.Errorf("%w: status %d", ErrUpstream, resp.StatusCode)
	}

	if err := json.NewDecoder(io.LimitReader(resp.Body, 4<<20)).Decode(out); err != nil {
		return fmt.Errorf("%w: decode: %v", ErrUpstream, err)
	}
	return nil
}
