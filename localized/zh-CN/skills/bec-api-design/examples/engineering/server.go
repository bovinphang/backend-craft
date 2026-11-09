package idempotency

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"sync"
	"sync/atomic"
)

type Intent struct {
	Item     string `json:"item"`
	Quantity int    `json:"quantity"`
}
type stored struct {
	intent Intent
	result string
}
type Server struct {
	mu        sync.Mutex
	entries   map[string]stored
	effect    func(Intent) string
	principal func(*http.Request) string
	failNext  atomic.Bool
}

// principal must be supplied by a verified authentication adapter. Tests use a
// synthetic constant. This sample does not authenticate a header or payload.
func New(effect func(Intent) string, principal func(*http.Request) string) *Server {
	return &Server{entries: make(map[string]stored), effect: effect, principal: principal}
}
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method", 405)
		return
	}
	principal := s.principal(r)
	if principal == "" {
		http.Error(w, "unauthenticated", 401)
		return
	}
	key := r.Header.Get("Idempotency-Key")
	if key == "" || len(key) > 256 {
		http.Error(w, "invalid key", 400)
		return
	}
	var intent Intent
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096))
	decoder.DisallowUnknownFields()
	if decoder.Decode(&intent) != nil || intent.Item == "" || intent.Quantity <= 0 {
		http.Error(w, "invalid intent", 400)
		return
	}
	var extra any
	if decoder.Decode(&extra) != io.EOF {
		http.Error(w, "trailing input", 400)
		return
	}
	scoped := principal + "\x00" + key
	s.mu.Lock()
	entry, found := s.entries[scoped]
	if os.Getenv("CRAFT_ENGINEERING_DEFECTIVE") == "1" {
		found = false
	}
	if found && entry.intent != intent {
		s.mu.Unlock()
		http.Error(w, "different intent", 409)
		return
	}
	if !found {
		entry = stored{intent: intent, result: s.effect(intent)}
		s.entries[scoped] = entry
	}
	s.mu.Unlock()
	// The effect and result have already committed in process memory. A failed
	// response must not permit a new effect on replay of this key and intent.
	if s.failNext.Swap(false) {
		http.Error(w, "outcome unknown; reconcile with same operation", 503)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = io.WriteString(w, entry.result)
}
