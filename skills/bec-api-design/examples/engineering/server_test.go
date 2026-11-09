package idempotency

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
)

func fixture(t *testing.T) (*Server, *httptest.Server, *atomic.Int32) {
	t.Helper()
	var effects atomic.Int32
	s := New(func(i Intent) string { return fmt.Sprintf("receipt-%d-%s-%d", effects.Add(1), i.Item, i.Quantity) }, func(*http.Request) string { return "synthetic-test-principal" })
	httpServer := httptest.NewServer(s)
	t.Cleanup(httpServer.Close)
	return s, httpServer, &effects
}
func post(client *http.Client, url, key, body string) (int, string, error) {
	request, err := http.NewRequest(http.MethodPost, url, strings.NewReader(body))
	if err != nil {
		return 0, "", err
	}
	request.Header.Set("Idempotency-Key", key)
	response, err := client.Do(request)
	if err != nil {
		return 0, "", err
	}
	defer response.Body.Close()
	result, err := io.ReadAll(response.Body)
	return response.StatusCode, string(result), err
}
func TestRetryAfterCommittedResponseFailure(t *testing.T) {
	s, h, effects := fixture(t)
	s.failNext.Store(true)
	status, _, err := post(h.Client(), h.URL, "one", `{"item":"book","quantity":1}`)
	if err != nil {
		t.Fatal(err)
	}
	if status != 503 || effects.Load() != 1 {
		t.Fatal("CRAFT_ASSERTION: expected commit before failed response")
	}
	status, result, err := post(h.Client(), h.URL, "one", `{"quantity":1,"item":"book"}`)
	if err != nil {
		t.Fatal(err)
	}
	if status != 200 || result != "receipt-1-book-1" || effects.Load() != 1 {
		t.Fatalf("CRAFT_ASSERTION: replay changed committed result: %d %q effects=%d", status, result, effects.Load())
	}
	status, again, err := post(h.Client(), h.URL, "one", `{"item":"book","quantity":1}`)
	if err != nil {
		t.Fatal(err)
	}
	if status != 200 || again != result || effects.Load() != 1 {
		t.Fatal("CRAFT_ASSERTION: repeated replay must reuse result")
	}
}
func TestSameKeyDifferentIntentRejected(t *testing.T) {
	_, h, effects := fixture(t)
	status, _, err := post(h.Client(), h.URL, "one", `{"item":"book","quantity":1}`)
	if err != nil || status != 200 {
		t.Fatalf("setup: %d %v", status, err)
	}
	status, _, err = post(h.Client(), h.URL, "one", `{"item":"book","quantity":2}`)
	if err != nil {
		t.Fatal(err)
	}
	if status != 409 || effects.Load() != 1 {
		t.Fatalf("CRAFT_ASSERTION: changed intent must conflict without effect: %d effects=%d", status, effects.Load())
	}
}
func TestConcurrentReplayHasOneEffect(t *testing.T) {
	_, h, effects := fixture(t)
	const count = 16
	start := make(chan struct{})
	results := make(chan string, count)
	errors := make(chan error, count)
	var group sync.WaitGroup
	for i := 0; i < count; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			<-start
			status, result, err := post(h.Client(), h.URL, "one", `{"item":"book","quantity":1}`)
			if err != nil {
				errors <- err
				return
			}
			if status != 200 {
				errors <- fmt.Errorf("status %d", status)
				return
			}
			results <- result
		}()
	}
	close(start)
	group.Wait()
	close(results)
	close(errors)
	for err := range errors {
		t.Error(err)
	}
	n := 0
	for result := range results {
		n++
		if result != "receipt-1-book-1" {
			t.Errorf("CRAFT_ASSERTION: divergent replay result %q", result)
		}
	}
	if n != count || effects.Load() != 1 {
		t.Fatalf("CRAFT_ASSERTION: concurrent replay produced %d effects, %d results", effects.Load(), n)
	}
}
