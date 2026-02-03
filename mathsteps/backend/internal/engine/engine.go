// Package engine defines the interface all arithmetic method engines implement.
//
// Each engine is a pure function: operands in, structured step data out.
// No side effects, no state, no I/O. Engines do not know about HTTP,
// Flutter, databases, or anything outside of arithmetic.
//
// CRITICAL RULE: Engines compute algorithmically. Never hardcode answers.
// Never use lookup tables. The engine must produce the correct answer
// and working for ANY valid operands.
package engine

import "github.com/silkyrich/mathsteps/internal/models"

// Method is the interface every arithmetic method implements.
// Column addition, decomposition subtraction, grid multiplication,
// and bus stop division all satisfy this interface.
type Method interface {
	// Name returns the human-readable method name, e.g. "Column Addition".
	Name() string

	// Operation returns which arithmetic operation this method solves.
	Operation() models.Operation

	// CanSolve reports whether this method can solve a problem with the
	// given operands. For example, short division requires divisor ≤ 12.
	CanSolve(operands []int) bool

	// GenerateSteps produces the ordered list of steps that solve the problem.
	// This is the core computation. Steps are returned in the order the
	// student should complete them (right-to-left for addition, etc.).
	GenerateSteps(operands []int) []models.StepInput

	// Layout returns the grid dimensions for rendering.
	Layout(operands []int) models.OperationLayout

	// Cells returns rendering instructions for the working grid.
	// steps is the current state of the solution (with statuses).
	Cells(operands []int, steps []models.StepInput) []models.GridCell

	// Explain returns a human-readable explanation for the step at index.
	Explain(operands []int, steps []models.StepInput, stepIndex int) models.StepExplanation
}

// Registry maps operations to their method implementations.
var Registry = map[models.Operation]Method{}

// Register adds a method to the global registry.
// Called by each engine package's init() function.
func Register(m Method) {
	Registry[m.Operation()] = m
}
