// Package models defines the core data structures for MathSteps.
//
// These types are the contract between the engine (computation) and
// the client (display). The engine produces them, the API serves them
// as JSON, and the Flutter app renders them.
//
// If you change these types, you change the API contract.
package models

// Operation is the type of arithmetic operation.
type Operation string

const (
	Addition       Operation = "addition"
	Subtraction    Operation = "subtraction"
	Multiplication Operation = "multiplication"
	ShortDivision  Operation = "shortDivision"
)

// StepType describes what kind of step this is in the working.
type StepType string

const (
	StepAnswerDigit  StepType = "answer_digit"
	StepCarry        StepType = "carry"
	StepBorrow       StepType = "borrow"
	StepPartial      StepType = "partial"       // grid multiplication partial product
	StepRowTotal     StepType = "row_total"      // grid multiplication row sum
	StepFinalTotal   StepType = "final_total"    // grid multiplication final sum
	StepQuotient     StepType = "quotient_digit" // short division quotient digit
	StepDivCarry     StepType = "div_carry"      // short division carry
	StepRemainder    StepType = "remainder"      // short division remainder
)

// StepStatus tracks where a step is in the user's progress.
type StepStatus string

const (
	StatusPending   StepStatus = "pending"
	StatusActive    StepStatus = "active"
	StatusCompleted StepStatus = "completed"
)

// CellLayer separates overlapping elements in the grid.
// Main layer is the primary working. Carry layer is above (carries/borrows).
type CellLayer string

const (
	LayerMain  CellLayer = "main"
	LayerCarry CellLayer = "carry"
)

// CellStatus describes the visual state of a grid cell.
type CellStatus string

const (
	CellFixed     CellStatus = "fixed"     // operand digit, operator — not editable
	CellPending   CellStatus = "pending"   // not yet reached
	CellActive    CellStatus = "active"    // current step
	CellCompleted CellStatus = "completed" // filled in correctly
	CellTentative CellStatus = "tentative" // partially entered (e.g. first digit of two-digit entry)
)

// Position locates a cell or step in the working grid.
type Position struct {
	Row   int       `json:"row"`
	Col   int       `json:"col"`
	Layer CellLayer `json:"layer"`
}

// StepInput is a single step in the solution working.
// The engine produces a list of these. The UI walks through them.
type StepInput struct {
	ID            string     `json:"id"`
	Type          StepType   `json:"type"`
	Position      Position   `json:"position"`
	CorrectValue  int        `json:"correctValue"`
	EnteredValue  *int       `json:"enteredValue,omitempty"`
	Status        StepStatus `json:"status"`
	LinkedStepID  string     `json:"linkedStepId,omitempty"`  // e.g. carry linked to its answer digit
	CompoundValue *int       `json:"compoundValue,omitempty"` // full column sum when carry needed
}

// GridCell is a rendering instruction for one cell in the working grid.
// The Flutter app receives these and draws them. No maths happens client-side.
type GridCell struct {
	Row      int        `json:"row"`
	Col      int        `json:"col"`
	Layer    CellLayer  `json:"layer"`
	Content  string     `json:"content"`
	Editable bool       `json:"editable"`
	Status   CellStatus `json:"status"`
	Type     StepType   `json:"type,omitempty"`
	StepID   string     `json:"stepId,omitempty"`
}

// OperationLayout describes the grid dimensions and where the line goes.
type OperationLayout struct {
	Rows         int `json:"rows"`
	Cols         int `json:"cols"`
	LineAfterRow int `json:"lineAfterRow"` // horizontal line drawn after this row
}

// StepExplanation is the human-readable text for a step.
// Shown below the working grid to guide the child.
type StepExplanation struct {
	Title  string `json:"title"`
	Detail string `json:"detail"`
}

// Problem is a maths problem with its operands and computed answer.
type Problem struct {
	ID        string    `json:"id"`
	Operation Operation `json:"operation"`
	Operands  []int     `json:"operands"`
	Answer    int       `json:"answer"`
	Remainder *int      `json:"remainder,omitempty"`
}

// SolveResponse is the full API response for solving a problem.
// Contains everything the client needs to render the step-by-step working.
type SolveResponse struct {
	Problem      Problem         `json:"problem"`
	Steps        []StepInput     `json:"steps"`
	Layout       OperationLayout `json:"layout"`
	Cells        []GridCell      `json:"cells"`
	Explanations []StepExplanation `json:"explanations"`
}
