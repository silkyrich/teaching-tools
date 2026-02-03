// Package handler implements HTTP handlers for the MathSteps API.
package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/silkyrich/mathsteps/internal/engine"
	"github.com/silkyrich/mathsteps/internal/models"
)

// SolveRequest is the JSON body for POST /solve.
type SolveRequest struct {
	Operation models.Operation `json:"operation"`
	Operands  []int            `json:"operands"`
}

// ErrorResponse is returned on errors.
type ErrorResponse struct {
	Error string `json:"error"`
}

// Solve handles POST /solve.
// Takes an operation and operands, returns complete step-by-step working.
func Solve(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "POST only")
		return
	}

	var req SolveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON: "+err.Error())
		return
	}

	method, ok := engine.Registry[req.Operation]
	if !ok {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("unknown operation: %s", req.Operation))
		return
	}

	if !method.CanSolve(req.Operands) {
		writeError(w, http.StatusBadRequest, "invalid operands for this operation")
		return
	}

	steps := method.GenerateSteps(req.Operands)
	layout := method.Layout(req.Operands)
	cells := method.Cells(req.Operands, steps)

	explanations := make([]models.StepExplanation, len(steps)+1)
	for i := range steps {
		explanations[i] = method.Explain(req.Operands, steps, i)
	}
	explanations[len(steps)] = method.Explain(req.Operands, steps, len(steps))

	// Compute the answer algorithmically.
	answer := 0
	var remainder *int
	switch req.Operation {
	case models.Addition:
		for _, n := range req.Operands {
			answer += n
		}
	case models.Subtraction:
		answer = req.Operands[0] - req.Operands[1]
	case models.Multiplication:
		answer = req.Operands[0] * req.Operands[1]
	case models.ShortDivision:
		answer = req.Operands[1] / req.Operands[0]
		rem := req.Operands[1] % req.Operands[0]
		if rem != 0 {
			remainder = &rem
		}
	}

	resp := models.SolveResponse{
		Problem: models.Problem{
			ID:        fmt.Sprintf("problem-%d", 1), // TODO: proper ID generation
			Operation: req.Operation,
			Operands:  req.Operands,
			Answer:    answer,
			Remainder: remainder,
		},
		Steps:        steps,
		Layout:       layout,
		Cells:        cells,
		Explanations: explanations,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Health handles GET /health.
func Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func writeError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: msg})
}
