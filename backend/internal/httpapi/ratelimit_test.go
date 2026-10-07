package httpapi

import "testing"

func TestIPLimiter(t *testing.T) {
	l := newIPLimiter(0.001, 2)

	if !l.allow("1.1.1.1") || !l.allow("1.1.1.1") {
		t.Fatal("first two requests must pass")
	}
	if l.allow("1.1.1.1") {
		t.Fatal("third request must be limited")
	}
	if !l.allow("2.2.2.2") {
		t.Fatal("another IP has its own bucket")
	}
}
