package httpapi

import (
	"context"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type clientEntry struct {
	lim      *rate.Limiter
	lastSeen time.Time
}

// ipLimiter is a per-IP token bucket.
type ipLimiter struct {
	mu      sync.Mutex
	clients map[string]*clientEntry
	rps     rate.Limit
	burst   int
}

// newIPLimiter creates and returns a new per-IP rate limiter instance.
func newIPLimiter(rps float64, burst int) *ipLimiter {
	return &ipLimiter{
		clients: make(map[string]*clientEntry),
		rps:     rate.Limit(rps),
		burst:   burst,
	}
}

// allow checks whether a request from the given IP address is permitted under the rate limit rules.
func (l *ipLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	e, ok := l.clients[ip]
	if !ok {
		e = &clientEntry{lim: rate.NewLimiter(l.rps, l.burst)}
		l.clients[ip] = e
	}
	e.lastSeen = time.Now()

	return e.lim.Allow()
}

// cleanup drops idle clients until ctx is cancelled.
func (l *ipLimiter) cleanup(ctx context.Context, every, ttl time.Duration) {
	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			l.mu.Lock()
			for ip, e := range l.clients {
				if time.Since(e.lastSeen) > ttl {
					delete(l.clients, ip)
				}
			}
			l.mu.Unlock()
		}
	}
}
