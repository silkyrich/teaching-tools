package engines

import "fmt"

// SubtractionLayout describes the grid layout for a subtraction problem.
type SubtractionLayout struct {
	Rows        int
	Cols        int
	OperandARow int
	OperandBRow int
	AnswerRow   int
	BorrowRow   int
	OperatorCol int
}

// GetSubtractionLayout computes the grid layout for a - b.
func GetSubtractionLayout(a, b int) SubtractionLayout {
	maxLen := maxInt(len(toDigits(a)), len(toDigits(b)))
	cols := maxLen + 1 // +1 for operator column

	return SubtractionLayout{
		Rows:        4, // borrow, operandA, operandB, answer
		Cols:        cols,
		BorrowRow:   0,
		OperandARow: 1,
		OperandBRow: 2,
		AnswerRow:   3,
		OperatorCol: 0,
	}
}

// GenerateSubtractionSteps generates the step-by-step solution for a - b.
func GenerateSubtractionSteps(a, b int) []StepInput {
	digitsA := toDigits(a)
	digitsB := toDigits(b)
	maxLen := maxInt(len(digitsA), len(digitsB))

	for len(digitsA) < maxLen {
		digitsA = append([]int{0}, digitsA...)
	}
	for len(digitsB) < maxLen {
		digitsB = append([]int{0}, digitsB...)
	}

	layout := GetSubtractionLayout(a, b)
	var steps []StepInput
	stepIndex := 0

	// Track borrows
	workingA := make([]int, len(digitsA))
	copy(workingA, digitsA)

	// Work right-to-left
	for i := maxLen - 1; i >= 0; i-- {
		topDigit := workingA[i]
		bottomDigit := digitsB[i]
		col := i + 1 // offset for operator column

		if topDigit < bottomDigit {
			// Need to borrow
			borrowFrom := i - 1
			for borrowFrom >= 0 && workingA[borrowFrom] == 0 {
				borrowFrom--
			}

			if borrowFrom >= 0 {
				workingA[borrowFrom]--
				for j := borrowFrom + 1; j < i; j++ {
					workingA[j] = 9
				}
				topDigit = workingA[i] + 10
				workingA[i] = topDigit
			}

			linkedAnswerStepID := fmt.Sprintf("step-%d", stepIndex+1)
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         Borrow,
				Position:     GridPosition{Row: layout.BorrowRow, Col: col, Layer: LayerBorrow},
				CorrectValue: topDigit,
				Status:       Pending,
				Label:        fmt.Sprintf("%d", topDigit),
				LinkedStepID: linkedAnswerStepID,
			})
			stepIndex++
		}

		// Answer digit
		effectiveTop := topDigit
		if effectiveTop == 0 && workingA[i] != 0 {
			effectiveTop = workingA[i]
		}
		answerDigit := effectiveTop - bottomDigit

		steps = append(steps, StepInput{
			ID:           fmt.Sprintf("step-%d", stepIndex),
			Type:         AnswerDigit,
			Position:     GridPosition{Row: layout.AnswerRow, Col: col, Layer: LayerMain},
			CorrectValue: answerDigit,
			Status:       Pending,
		})
		stepIndex++
	}

	return steps
}

// GetSubtractionGridCells returns the grid cells for rendering a subtraction problem.
func GetSubtractionGridCells(a, b int, steps []StepInput, showHints bool) []GridCell {
	digitsA := toDigits(a)
	digitsB := toDigits(b)
	maxLen := maxInt(len(digitsA), len(digitsB))
	layout := GetSubtractionLayout(a, b)

	for len(digitsA) < maxLen {
		digitsA = append([]int{0}, digitsA...)
	}
	for len(digitsB) < maxLen {
		digitsB = append([]int{0}, digitsB...)
	}

	var cells []GridCell

	// Operator symbol
	cells = append(cells, GridCell{
		Row:     layout.OperandBRow,
		Col:     layout.OperatorCol,
		Layer:   LayerMain,
		Content: "\u2212", // −
		Status:  Fixed,
	})

	// Operand A digits
	for i := 0; i < maxLen; i++ {
		col := i + 1
		if digitsA[i] != 0 || i > 0 {
			cells = append(cells, GridCell{
				Row:     layout.OperandARow,
				Col:     col,
				Layer:   LayerMain,
				Content: fmt.Sprintf("%d", digitsA[i]),
				Status:  Fixed,
			})
		}
	}

	// Operand B digits
	for i := 0; i < maxLen; i++ {
		col := i + 1
		if digitsB[i] != 0 || i > 0 {
			cells = append(cells, GridCell{
				Row:     layout.OperandBRow,
				Col:     col,
				Layer:   LayerMain,
				Content: fmt.Sprintf("%d", digitsB[i]),
				Status:  Fixed,
			})
		}
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

// GetSubtractionOperationLayout returns the OperationLayout for a subtraction problem.
func GetSubtractionOperationLayout(operands []int) OperationLayout {
	a, b := operands[0], operands[1]
	layout := GetSubtractionLayout(a, b)
	lineAfter := layout.OperandBRow
	return OperationLayout{Rows: layout.Rows, Cols: layout.Cols, LineAfterRow: &lineAfter}
}

// GetSubtractionStepExplanation returns a human-readable explanation for the current step.
func GetSubtractionStepExplanation(operands []int, steps []StepInput, currentStepIndex int) StepExplanation {
	a, b := operands[0], operands[1]
	digitsA := toDigits(a)
	digitsB := toDigits(b)
	maxLen := maxInt(len(digitsA), len(digitsB))
	for len(digitsA) < maxLen {
		digitsA = append([]int{0}, digitsA...)
	}
	for len(digitsB) < maxLen {
		digitsB = append([]int{0}, digitsB...)
	}

	if currentStepIndex >= len(steps) {
		return StepExplanation{
			Title:  "Complete!",
			Detail: fmt.Sprintf("The answer is %d.", a-b),
		}
	}

	step := steps[currentStepIndex]
	col := step.Position.Col
	colFromRight := maxLen - (col - 1)
	placeNames := []string{"ones", "tens", "hundreds", "thousands", "ten-thousands"}
	placeName := fmt.Sprintf("place %d", colFromRight)
	if colFromRight-1 >= 0 && colFromRight-1 < len(placeNames) {
		placeName = placeNames[colFromRight-1]
	}

	if step.Type == Borrow {
		return StepExplanation{
			Title:  fmt.Sprintf("Borrow for the %s column", placeName),
			Detail: fmt.Sprintf("The top digit is smaller than the bottom, so borrow from the next column. The top becomes %d.", step.CorrectValue),
		}
	}

	topDigit := digitsA[col-1]
	bottomDigit := digitsB[col-1]
	effectiveTop := topDigit
	for _, s := range steps {
		if s.Type == Borrow && s.Status == Completed && s.Position.Col == col {
			effectiveTop = s.CorrectValue
			break
		}
	}

	return StepExplanation{
		Title:  fmt.Sprintf("Subtract the %s column", placeName),
		Detail: fmt.Sprintf("%d - %d = %d", effectiveTop, bottomDigit, step.CorrectValue),
	}
}
