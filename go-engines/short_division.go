package engines

import "fmt"

// ShortDivisionLayout describes the grid layout for a short division problem.
type ShortDivisionLayout struct {
	Rows         int
	Cols         int
	QuotientRow  int
	DividendRow  int
	RemainderRow int
	DivisorCol   int
	FirstDigitCol int
}

// GetShortDivisionLayout computes the grid layout for divisor ) dividend.
func GetShortDivisionLayout(divisor, dividend int) ShortDivisionLayout {
	dividendDigits := toDigits(dividend)
	divisorLen := len(toDigits(divisor))
	cols := divisorLen + 1 + len(dividendDigits)

	return ShortDivisionLayout{
		Rows:         3, // quotient, dividend, carry remainders
		Cols:         cols,
		QuotientRow:  0,
		DividendRow:  1,
		RemainderRow: 2,
		DivisorCol:   0,
		FirstDigitCol: divisorLen + 1,
	}
}

// GenerateShortDivisionSteps generates the step-by-step solution for short division.
func GenerateShortDivisionSteps(divisor, dividend int) []StepInput {
	dividendDigits := toDigits(dividend)
	layout := GetShortDivisionLayout(divisor, dividend)
	var steps []StepInput
	stepIndex := 0
	carry := 0

	for i := 0; i < len(dividendDigits); i++ {
		current := carry*10 + dividendDigits[i]
		quotientDigit := current / divisor
		remainder := current % divisor
		col := layout.FirstDigitCol + i

		// Quotient digit
		steps = append(steps, StepInput{
			ID:           fmt.Sprintf("step-%d", stepIndex),
			Type:         AnswerDigit,
			Position:     GridPosition{Row: layout.QuotientRow, Col: col, Layer: LayerMain},
			CorrectValue: quotientDigit,
			Status:       Pending,
		})
		stepIndex++

		// Remainder carry (if non-zero and not last digit)
		if remainder > 0 && i < len(dividendDigits)-1 {
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         RemainderStep,
				Position:     GridPosition{Row: layout.RemainderRow, Col: col, Layer: LayerCarry},
				CorrectValue: remainder,
				Status:       Pending,
			})
			stepIndex++
		}

		// Final remainder
		if remainder > 0 && i == len(dividendDigits)-1 {
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         RemainderStep,
				Position:     GridPosition{Row: layout.QuotientRow, Col: col + 1, Layer: LayerMain},
				CorrectValue: remainder,
				Status:       Pending,
				Label:        "r",
			})
			stepIndex++
		}

		carry = remainder
	}

	return steps
}

// GetShortDivisionGridCells returns the grid cells for rendering a short division problem.
func GetShortDivisionGridCells(divisor, dividend int, steps []StepInput, showHints bool) []GridCell {
	dividendDigits := toDigits(dividend)
	divisorStr := fmt.Sprintf("%d", divisor)
	layout := GetShortDivisionLayout(divisor, dividend)
	var cells []GridCell

	// Divisor digits
	for i := 0; i < len(divisorStr); i++ {
		cells = append(cells, GridCell{
			Row:     layout.DividendRow,
			Col:     i,
			Layer:   LayerMain,
			Content: string(divisorStr[i]),
			Status:  Fixed,
		})
	}

	// Bracket
	cells = append(cells, GridCell{
		Row:     layout.DividendRow,
		Col:     len(divisorStr),
		Layer:   LayerMain,
		Content: ")",
		Status:  Fixed,
		Type:    AnswerDigit,
	})

	// Dividend digits
	for i := 0; i < len(dividendDigits); i++ {
		cells = append(cells, GridCell{
			Row:     layout.DividendRow,
			Col:     layout.FirstDigitCol + i,
			Layer:   LayerMain,
			Content: fmt.Sprintf("%d", dividendDigits[i]),
			Status:  Fixed,
		})
	}

	// Step-based cells
	for _, step := range steps {
		isCompleted := step.Status == Completed
		isActive := step.Status == Active

		content := ""
		if isCompleted || (showHints && isActive) {
			if step.Label == "r" {
				content = fmt.Sprintf("r%d", step.CorrectValue)
			} else {
				content = fmt.Sprintf("%d", step.CorrectValue)
			}
		}

		var status CellStatus
		if isActive {
			status = CellActive
		} else if isCompleted {
			status = CellCompleted
		} else {
			status = CellPending
		}

		cells = append(cells, GridCell{
			Row:      step.Position.Row,
			Col:      step.Position.Col,
			Layer:    step.Position.Layer,
			Content:  content,
			Editable: true,
			Status:   status,
			Type:     step.Type,
			StepID:   step.ID,
		})
	}

	return cells
}

// GetShortDivisionOperationLayout returns the OperationLayout for a short division problem.
func GetShortDivisionOperationLayout(operands []int) OperationLayout {
	divisor, dividend := operands[0], operands[1]
	layout := GetShortDivisionLayout(divisor, dividend)
	return OperationLayout{Rows: layout.Rows, Cols: layout.Cols}
}

// GetShortDivisionStepExplanation returns a human-readable explanation for the current step.
func GetShortDivisionStepExplanation(operands []int, steps []StepInput, currentStepIndex int) StepExplanation {
	divisor, dividend := operands[0], operands[1]
	dividendDigits := toDigits(dividend)

	if currentStepIndex >= len(steps) {
		q := dividend / divisor
		r := dividend % divisor
		detail := fmt.Sprintf("%d / %d = %d", dividend, divisor, q)
		if r > 0 {
			detail += fmt.Sprintf(" remainder %d", r)
		}
		detail += "."
		return StepExplanation{Title: "Complete!", Detail: detail}
	}

	step := steps[currentStepIndex]
	layout := GetShortDivisionLayout(divisor, dividend)
	digitIndex := step.Position.Col - layout.FirstDigitCol

	if step.Type == AnswerDigit {
		carry := 0
		if digitIndex > 0 {
			for _, s := range steps {
				if s.Type == RemainderStep && s.Position.Col == step.Position.Col-1 && s.Status == Completed {
					carry = s.CorrectValue
					break
				}
			}
		}
		current := carry*10 + dividendDigits[digitIndex]
		return StepExplanation{
			Title:  fmt.Sprintf("Divide %d by %d", current, divisor),
			Detail: fmt.Sprintf("%d / %d = %d (%d x %d = %d)", current, divisor, step.CorrectValue, step.CorrectValue, divisor, step.CorrectValue*divisor),
		}
	}

	if step.Type == RemainderStep {
		if step.Label == "r" {
			return StepExplanation{
				Title:  "Final remainder",
				Detail: fmt.Sprintf("The remainder is %d. Write r%d.", step.CorrectValue, step.CorrectValue),
			}
		}
		// Find the quotient step just before
		q := 0
		for _, s := range steps {
			if s.Type == AnswerDigit && s.Position.Col == step.Position.Col {
				q = s.CorrectValue
				break
			}
		}
		return StepExplanation{
			Title:  "Write the remainder",
			Detail: fmt.Sprintf("%d x %d = %d, remainder %d. Carry %d to the next digit.", q, divisor, q*divisor, step.CorrectValue, step.CorrectValue),
		}
	}

	return StepExplanation{
		Title:  "Next step",
		Detail: fmt.Sprintf("Enter %d.", step.CorrectValue),
	}
}
