package cache

import (
	"context"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestTTLExpiry(t *testing.T) {
	c := New[string](time.Minute, 10)
	now := time.Unix(0, 0)
	c.now = func() time.Time { return now }

	c.Set("a", "1")
	if v, ok := c.Get("a"); !ok || v != "1" {
		t.Fatalf("Get = %q, %v; want 1, true", v, ok)
	}

	now = now.Add(2 * time.Minute)
	if _, ok := c.Get("a"); ok {
		t.Fatal("entry should have expired")
	}
}

func TestGetOrLoadDeduplicates(t *testing.T) {
	c := New[int](time.Minute, 10)

	var calls atomic.Int32
	release := make(chan struct{})
	load := func(ctx context.Context) (int, error) {
		calls.Add(1)
		<-release
		return 55, nil
	}

	var wg sync.WaitGroup
	for range 5 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			v, err := c.GetOrLoad(context.Background(), "k", load)
			if err != nil || v != 55 {
				t.Errorf("GetOrLoad = %d, %v; want 55, nil", v, err)
			}
		}()
	}

	time.Sleep(50 * time.Millisecond)
	close(release)
	wg.Wait()

	if n := calls.Load(); n != 1 {
		t.Fatalf("loader called %d times, want 1", n)
	}
}
