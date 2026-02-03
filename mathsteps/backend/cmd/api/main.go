// MathSteps API server.
//
// Serves step-by-step arithmetic working to the Flutter app.
// Stateless — no database, no auth, no sessions (Phase 1).
//
// Usage: go run ./cmd/api
// Default port: 8080 (override with PORT env var).
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	// Register all engines. Each package's init() calls engine.Register().
	_ "github.com/silkyrich/mathsteps/internal/engine/addition"

	"github.com/silkyrich/mathsteps/internal/handler"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handler.Health)
	mux.HandleFunc("/solve", handler.Solve)

	addr := fmt.Sprintf(":%s", port)
	log.Printf("MathSteps API listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
