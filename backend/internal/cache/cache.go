package cache

import (
	"context"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"
)

type entry[V any] struct {
	value   V
	expires time.Time
}

type TTL[V any] struct {
	mu       sync.Mutex
	items    map[string]entry[V]
	ttl      time.Duration
	maxItems int
	now      func() time.Time
	group    singleflight.Group
}

// New creates and returns a new TTL cache instance with the specified default TTL and capacity.
func New[V any](ttl time.Duration, maxItems int) *TTL[V] {
	return &TTL[V]{
		items:    make(map[string]entry[V]),
		ttl:      ttl,
		maxItems: maxItems,
		now:      time.Now,
	}
}

// Get retrieves a value by key, returning the value and true if it exists and hasn't expired.
func (c *TTL[V]) Get(key string) (V, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	var zero V
	e, ok := c.items[key]
	if !ok {
		return zero, false
	}
	if !c.now().Before(e.expires) {
		delete(c.items, key)
		return zero, false
	}

	return e.value, true
}

// Set stores a value in the cache with the configured TTL.
func (c *TTL[V]) Set(key string, v V) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.items) >= c.maxItems {
		c.evictLocked()
	}

	c.items[key] = entry[V]{value: v, expires: c.now().Add(c.ttl)}
}

// evictLocked removes expired items or arbitrary entries if the cache exceeds its maximum capacity.
func (c *TTL[V]) evictLocked() {
	now := c.now()
	for k, e := range c.items {
		if !now.Before(e.expires) {
			delete(c.items, k)
		}
	}

	for k := range c.items {
		if len(c.items) < c.maxItems {
			break
		}
		delete(c.items, k)
	}
}

// GetOrLoad returns a cached value for the key or loads it using singleflight if missing.
func (c *TTL[V]) GetOrLoad(
	ctx context.Context,
	key string,
	load func(ctx context.Context) (V, error),
) (V, error) {
	if v, ok := c.Get(key); ok {
		return v, nil
	}

	ch := c.group.DoChan(key, func() (any, error) {
		v, err := load(context.WithoutCancel(ctx))
		if err != nil {
			return nil, err
		}
		c.Set(key, v)
		return v, nil
	})

	var zero V
	select {
	case <-ctx.Done():
		return zero, ctx.Err()
	case res := <-ch:
		if res.Err != nil {
			return zero, res.Err
		}
		return res.Val.(V), nil
	}
}
