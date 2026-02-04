package engines

// OperationConfig holds the functions that define how an operation works.
type OperationConfig struct {
	GetLayout          func(operands []int) OperationLayout
	GetCells           func(operands []int, steps []StepInput, showHints bool, pendingFirstDigit *int) []GridCell
	GetStepExplanation func(operands []int, steps []StepInput, currentStepIndex int) StepExplanation
}

// Registry returns the full operation registry mapping each Operation to its config.
func Registry() map[Operation]OperationConfig {
	return map[Operation]OperationConfig{
		Addition: {
			GetLayout: GetAdditionOperationLayout,
			GetCells: func(operands []int, steps []StepInput, showHints bool, pendingFirstDigit *int) []GridCell {
				return GetAdditionGridCells(operands, steps, showHints, pendingFirstDigit)
			},
			GetStepExplanation: GetAdditionStepExplanation,
		},
		Subtraction: {
			GetLayout: GetSubtractionOperationLayout,
			GetCells: func(operands []int, steps []StepInput, showHints bool, _ *int) []GridCell {
				return GetSubtractionGridCells(operands[0], operands[1], steps, showHints)
			},
			GetStepExplanation: GetSubtractionStepExplanation,
		},
		Multiplication: {
			GetLayout: GetMultiplicationOperationLayout,
			GetCells: func(operands []int, steps []StepInput, showHints bool, _ *int) []GridCell {
				return GetMultiplicationGridCells(operands[0], operands[1], steps, showHints)
			},
			GetStepExplanation: GetMultiplicationStepExplanation,
		},
		ShortDivision: {
			GetLayout: GetShortDivisionOperationLayout,
			GetCells: func(operands []int, steps []StepInput, showHints bool, _ *int) []GridCell {
				return GetShortDivisionGridCells(operands[0], operands[1], steps, showHints)
			},
			GetStepExplanation: GetShortDivisionStepExplanation,
		},
		LongDivision: {
			GetLayout: GetLongDivisionOperationLayout,
			GetCells: func(operands []int, steps []StepInput, showHints bool, _ *int) []GridCell {
				return GetLongDivisionGridCells(operands[0], operands[1], steps, showHints)
			},
			GetStepExplanation: GetLongDivisionStepExplanation,
		},
	}
}
