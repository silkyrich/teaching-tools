package engines

import "fmt"

// MultiplicationLayout describes the grid layout for a multiplication problem.
type MultiplicationLayout struct {
	Rows                   int
	Cols                   int
	OperandARow            int
	OperandBRow            int
	PartialProductStartRow int
	AnswerRow              int
	CarryRow               int
}

// GetMultiplicationLayout computes the grid layout for a × b.
func GetMultiplicationLayout(a, b int) MultiplicationLayout {
	digitsB := toDigits(b)
	maxProductLen := len(toDigits(a * b))
	cols := maxProductLen + 1 // +1 for operator column
	numPartials := len(digitsB)

	rows := 2 + numPartials
	if numPartials > 1 {
		rows++ // extra row for final answer
	}

	return MultiplicationLayout{
		Rows:                   rows,
		Cols:                   cols,
		CarryRow:               -1, // carries shown inline
		OperandARow:            0,
		OperandBRow:            1,
		PartialProductStartRow: 2,
		AnswerRow:              2 + numPartials, // only used when >1 partial
	}
}

// GenerateMultiplicationSteps generates the step-by-step solution for a × b.
func GenerateMultiplicationSteps(a, b int) []StepInput {
	digitsA := toDigits(a)
	digitsB := toDigits(b)
	layout := GetMultiplicationLayout(a, b)
	var steps []StepInput
	stepIndex := 0

	// Generate steps for each partial product row
	for bIdx := len(digitsB) - 1; bIdx >= 0; bIdx-- {
		bDigit := digitsB[bIdx]
		placeShift := len(digitsB) - 1 - bIdx
		partialRow := layout.PartialProductStartRow + placeShift

		carry := 0

		// Multiply right-to-left through A
		for aIdx := len(digitsA) - 1; aIdx >= 0; aIdx-- {
			product := digitsA[aIdx]*bDigit + carry
			digit := product % 10
			carry = product / 10

			col := layout.Cols - 1 - (len(digitsA) - 1 - aIdx) - placeShift

			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         PartialProduct,
				Position:     GridPosition{Row: partialRow, Col: col, Layer: LayerMain},
				CorrectValue: digit,
				Status:       Pending,
			})
			stepIndex++
		}

		// Final carry for this partial product
		if carry > 0 {
			col := layout.Cols - 1 - len(digitsA) - placeShift
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         PartialProduct,
				Position:     GridPosition{Row: partialRow, Col: col, Layer: LayerMain},
				CorrectValue: carry,
				Status:       Pending,
			})
			stepIndex++
		}
	}

	// If multiple partial products, add final answer row
	if len(digitsB) > 1 {
		totalAnswer := a * b
		answerDigits := toDigits(totalAnswer)

		for i := len(answerDigits) - 1; i >= 0; i-- {
			col := layout.Cols - 1 - (len(answerDigits) - 1 - i)
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         AnswerDigit,
				Position:     GridPosition{Row: layout.AnswerRow, Col: col, Layer: LayerMain},
				CorrectValue: answerDigits[i],
				Status:       Pending,
			})
			stepIndex++
		}
	}

	return steps
}

// GetMultiplicationGridCells returns the grid cells for rendering a multiplication problem.
func GetMultiplicationGridCells(a, b int, steps []StepInput, showHints bool) []GridCell {
	digitsA := toDigits(a)
	digitsB := toDigits(b)
	layout := GetMultiplicationLayout(a, b)
	var cells []GridCell

	// Operator symbol
	cells = append(cells, GridCell{
		Row:     layout.OperandBRow,
		Col:     0,
		Layer:   LayerMain,
		Content: "\u00d7", // ×
		Status:  Fixed,
	})

	// Operand A digits (right-aligned)
	for i := 0; i < len(digitsA); i++ {
		col := layout.Cols - 1 - (len(digitsA) - 1 - i)
		cells = append(cells, GridCell{
			Row:     layout.OperandARow,
			Col:     col,
			Layer:   LayerMain,
			Content: fmt.Sprintf("%d", digitsA[i]),
			Status:  Fixed,
		})
	}

	// Operand B digits (right-aligned)
	for i := 0; i < len(digitsB); i++ {
		col := layout.Cols - 1 - (len(digitsB) - 1 - i)
		cells = append(cells, GridCell{
			Row:     layout.OperandBRow,
			Col:     col,
			Layer:   LayerMain,
			Content: fmt.Sprintf("%d", digitsB[i]),
			Status:  Fixed,
		})
	}

	// Step-based cells
	for _, step := range steps {
		isCompleted := step.Status == Completed
		isActive := step.Status == Active
		content := ""
		if isCompleted || (showHints && isActive) {
			content = fmt.Sprintf("%d", step.CorrectValue)
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

// GetMultiplicationOperationLayout returns the OperationLayout for a multiplication problem.
func GetMultiplicationOperationLayout(operands []int) OperationLayout {
	a, b := operands[0], operands[1]
	layout := GetMultiplicationLayout(a, b)
	lineAfter := layout.OperandBRow
	return OperationLayout{Rows: layout.Rows, Cols: layout.Cols, LineAfterRow: &lineAfter}
}

// GetMultiplicationStepExplanation returns a human-readable explanation for the current step.
func GetMultiplicationStepExplanation(operands []int, steps []StepInput, currentStepIndex int) StepExplanation {
	a, b := operands[0], operands[1]
	digitsA := toDigits(a)
	digitsB := toDigits(b)

	if currentStepIndex >= len(steps) {
		return StepExplanation{
			Title:  "Complete!",
			Detail: fmt.Sprintf("The answer is %d.", a*b),
		}
	}

	step := steps[currentStepIndex]

	if step.Type == PartialProduct {
		layout := GetMultiplicationLayout(a, b)
		partialIdx := step.Position.Row - layout.PartialProductStartRow
		bDigitIdx := len(digitsB) - 1 - partialIdx
		bDigit := digitsB[bDigitIdx]

		placeShift := partialIdx
		aColFromRight := (layout.Cols - 1 - step.Position.Col) - placeShift
		aDigitIdx := len(digitsA) - 1 - aColFromRight

		if aDigitIdx >= 0 && aDigitIdx < len(digitsA) {
			aDigit := digitsA[aDigitIdx]

			// Compute carry from previous digits
			carry := 0
			for ai := len(digitsA) - 1; ai > aDigitIdx; ai-- {
				prod := digitsA[ai]*bDigit + carry
				carry = prod / 10
			}
			total := aDigit*bDigit + carry
			digit := total % 10
			newCarry := total / 10

			if carry > 0 {
				carryPart := fmt.Sprintf(" Write %d.", digit)
				if newCarry > 0 {
					carryPart = fmt.Sprintf(" Write %d, carry %d.", digit, newCarry)
				}
				return StepExplanation{
					Title:  fmt.Sprintf("Multiply %d \u00d7 %d", aDigit, bDigit),
					Detail: fmt.Sprintf("%d \u00d7 %d = %d, plus %d carried = %d.%s", aDigit, bDigit, aDigit*bDigit, carry, total, carryPart),
				}
			}
			carryPart := fmt.Sprintf(" Write %d.", digit)
			if newCarry > 0 {
				carryPart = fmt.Sprintf(" Write %d, carry %d.", digit, newCarry)
			}
			return StepExplanation{
				Title:  fmt.Sprintf("Multiply %d \u00d7 %d", aDigit, bDigit),
				Detail: fmt.Sprintf("%d \u00d7 %d = %d.%s", aDigit, bDigit, total, carryPart),
			}
		}

		return StepExplanation{
			Title:  "Write the final carry",
			Detail: fmt.Sprintf("The carried %d has no more digits to multiply, so write it down.", step.CorrectValue),
		}
	}

	if step.Type == AnswerDigit {
		return StepExplanation{
			Title:  "Add partial products",
			Detail: fmt.Sprintf("Add the partial products column to get %d.", step.CorrectValue),
		}
	}

	return StepExplanation{
		Title:  "Next step",
		Detail: fmt.Sprintf("Enter %d.", step.CorrectValue),
	}
}
