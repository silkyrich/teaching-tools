package engines

// Operation represents a math operation type.
type Operation string

const (
	Addition      Operation = "addition"
	Subtraction   Operation = "subtraction"
	Multiplication Operation = "multiplication"
	ShortDivision Operation = "shortDivision"
	LongDivision  Operation = "longDivision"
)

// NumberSize controls the digit count for generated problems.
type NumberSize string

const (
	Small  NumberSize = "small"
	Medium NumberSize = "medium"
	Large  NumberSize = "large"
)

// Support controls how much help the student gets.
type Support string

const (
	Full Support = "full"
	Some Support = "some"
	None Support = "none"
)

// InputMode determines whether problems are random or custom.
type InputMode string

const (
	Random InputMode = "random"
	Custom InputMode = "custom"
)

// Difficulty is a legacy type kept for URL backwards compat.
type Difficulty string

const (
	Easy   Difficulty = "easy"
	MediumDifficulty Difficulty = "medium"
	Hard   Difficulty = "hard"
)

// DifficultyToSettings converts a legacy Difficulty to NumberSize and Support.
func DifficultyToSettings(d Difficulty) (NumberSize, Support) {
	switch d {
	case Easy:
		return Small, Full
	case MediumDifficulty:
		return Medium, Some
	case Hard:
		return Large, None
	default:
		return Medium, Some
	}
}

// Problem represents a generated math problem.
type Problem struct {
	ID        string    `json:"id"`
	Operation Operation `json:"operation"`
	Operands  []int     `json:"operands"`
	Answer    int       `json:"answer"`
	Remainder *int      `json:"remainder,omitempty"`
}

// StepType identifies the kind of step in a solution.
type StepType string

const (
	AnswerDigit    StepType = "answer_digit"
	Carry          StepType = "carry"
	Borrow         StepType = "borrow"
	RemainderStep  StepType = "remainder"
	BringDown      StepType = "bring_down"
	PartialProduct StepType = "partial_product"
	PartialCarry   StepType = "partial_carry"
)

// Layer identifies which visual layer a grid position belongs to.
type Layer string

const (
	LayerMain    Layer = "main"
	LayerCarry   Layer = "carry"
	LayerBorrow  Layer = "borrow"
	LayerWorking Layer = "working"
)

// GridPosition locates a cell in the solution grid.
type GridPosition struct {
	Row   int   `json:"row"`
	Col   int   `json:"col"`
	Layer Layer `json:"layer"`
}

// StepStatus tracks the state of a step.
type StepStatus string

const (
	Pending   StepStatus = "pending"
	Active    StepStatus = "active"
	Completed StepStatus = "completed"
)

// StepInput represents a single interactive step in solving a problem.
type StepInput struct {
	ID            string       `json:"id"`
	Type          StepType     `json:"type"`
	Position      GridPosition `json:"position"`
	CorrectValue  int          `json:"correctValue"`
	EnteredValue  *int         `json:"enteredValue,omitempty"`
	Status        StepStatus   `json:"status"`
	Label         string       `json:"label,omitempty"`
	LinkedStepID  string       `json:"linkedStepId,omitempty"`
	CompoundValue *int         `json:"compoundValue,omitempty"`
}

// CellStatus tracks the display state of a grid cell.
type CellStatus string

const (
	Fixed     CellStatus = "fixed"
	CellPending   CellStatus = "pending"
	CellActive    CellStatus = "active"
	CellCompleted CellStatus = "completed"
	Hidden    CellStatus = "hidden"
	Tentative CellStatus = "tentative"
)

// GridCell represents a single cell in the visual grid.
type GridCell struct {
	Row      int        `json:"row"`
	Col      int        `json:"col"`
	Layer    Layer      `json:"layer"`
	Content  string     `json:"content"`
	Editable bool       `json:"editable"`
	Status   CellStatus `json:"status"`
	Type     StepType   `json:"type,omitempty"`
	StepID   string     `json:"stepId,omitempty"`
}

// StepExplanation provides a human-readable explanation for a step.
type StepExplanation struct {
	Title  string `json:"title"`
	Detail string `json:"detail"`
}

// OperationLayout describes the grid dimensions for an operation.
type OperationLayout struct {
	Rows         int  `json:"rows"`
	Cols         int  `json:"cols"`
	LineAfterRow *int `json:"lineAfterRow,omitempty"`
}

// ScoreData tracks scoring across operations.
type ScoreData struct {
	TotalCorrect   int                          `json:"totalCorrect"`
	TotalAttempted int                          `json:"totalAttempted"`
	StreakCurrent  int                          `json:"streakCurrent"`
	StreakBest     int                          `json:"streakBest"`
	ByOperation    map[Operation]OperationScore `json:"byOperation"`
}

// OperationScore tracks per-operation scoring.
type OperationScore struct {
	Correct   int `json:"correct"`
	Attempted int `json:"attempted"`
}
