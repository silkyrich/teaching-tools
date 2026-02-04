package engines

import "fmt"

// AdditionLayout describes the grid layout for an addition problem.
type AdditionLayout struct {
	Rows        int
	Cols        int
	OperandRows []int
	AnswerRow   int
	CarryRow    int
	OperatorCol int
	LineRow     int
}

// GetAdditionLayout computes the grid layout for the given operands.
func GetAdditionLayout(operands []int) AdditionLayout {
	allDigits := make([][]int, len(operands))
	maxLen := 0
	for i, n := range operands {
		allDigits[i] = toDigits(n)
		if len(allDigits[i]) > maxLen {
			maxLen = len(allDigits[i])
		}
	}
	answerLen := maxLen + 1 // possible carry
	cols := answerLen + 1   // +1 for operator column
	numOperands := len(operands)
	rows := 1 + numOperands + 1 // carry + operands + answer

	operandRows := make([]int, numOperands)
	for i := range operandRows {
		operandRows[i] = i + 1
	}

	return AdditionLayout{
		Rows:        rows,
		Cols:        cols,
		CarryRow:    0,
		OperandRows: operandRows,
		AnswerRow:   rows - 1,
		OperatorCol: 0,
		LineRow:     rows - 1,
	}
}

// GenerateAdditionSteps generates the step-by-step solution for an addition problem.
func GenerateAdditionSteps(operands []int) []StepInput {
	allDigits := make([][]int, len(operands))
	maxLen := 0
	for i, n := range operands {
		allDigits[i] = toDigits(n)
		if len(allDigits[i]) > maxLen {
			maxLen = len(allDigits[i])
		}
	}

	// Pad all to equal length
	for i := range allDigits {
		for len(allDigits[i]) < maxLen {
			allDigits[i] = append([]int{0}, allDigits[i]...)
		}
	}

	layout := GetAdditionLayout(operands)
	var steps []StepInput
	stepIndex := 0
	carry := 0

	// Work right-to-left through columns
	for i := maxLen - 1; i >= 0; i-- {
		columnSum := carry
		for _, d := range allDigits {
			columnSum += d[i]
		}
		answerDigit := columnSum % 10
		newCarry := columnSum / 10

		col := i + 1 + (layout.Cols - 1 - maxLen)

		answerStepID := fmt.Sprintf("step-%d", stepIndex)
		stepIndex++

		step := StepInput{
			ID:           answerStepID,
			Type:         AnswerDigit,
			Position:     GridPosition{Row: layout.AnswerRow, Col: col, Layer: LayerMain},
			CorrectValue: answerDigit,
			Status:       Pending,
		}
		if newCarry > 0 {
			step.CompoundValue = intPtr(columnSum)
		}
		steps = append(steps, step)

		// Carry digit if needed
		if newCarry > 0 {
			carryCol := col - 1
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         Carry,
				Position:     GridPosition{Row: layout.CarryRow, Col: carryCol, Layer: LayerCarry},
				CorrectValue: newCarry,
				Status:       Pending,
				LinkedStepID: answerStepID,
			})
			stepIndex++
		}

		carry = newCarry
	}

	// Final carry that extends the answer
	if carry > 0 {
		steps = append(steps, StepInput{
			ID:           fmt.Sprintf("step-%d", stepIndex),
			Type:         AnswerDigit,
			Position:     GridPosition{Row: layout.AnswerRow, Col: 1, Layer: LayerMain},
			CorrectValue: carry,
			Status:       Pending,
		})
	}

	return steps
}

// GetAdditionGridCells returns the grid cells for rendering an addition problem.
func GetAdditionGridCells(operands []int, steps []StepInput, showHints bool, pendingFirstDigit *int) []GridCell {
	allDigits := make([][]int, len(operands))
	maxLen := 0
	for i, n := range operands {
		allDigits[i] = toDigits(n)
		if len(allDigits[i]) > maxLen {
			maxLen = len(allDigits[i])
		}
	}

	layout := GetAdditionLayout(operands)

	// Pad all to equal length
	for i := range allDigits {
		for len(allDigits[i]) < maxLen {
			allDigits[i] = append([]int{0}, allDigits[i]...)
		}
	}

	var cells []GridCell

	// Operator symbol on last operand row
	lastOperandRow := layout.OperandRows[len(layout.OperandRows)-1]
	cells = append(cells, GridCell{
		Row:     lastOperandRow,
		Col:     layout.OperatorCol,
		Layer:   LayerMain,
		Content: "+",
		Status:  Fixed,
	})

	// All operand digits
	for opIdx := 0; opIdx < len(operands); opIdx++ {
		d := allDigits[opIdx]
		row := layout.OperandRows[opIdx]
		for i := 0; i < maxLen; i++ {
			col := i + 1 + (layout.Cols - 1 - maxLen)
			if d[i] != 0 || i > 0 {
				cells = append(cells, GridCell{
					Row:     row,
					Col:     col,
					Layer:   LayerMain,
					Content: fmt.Sprintf("%d", d[i]),
					Status:  Fixed,
				})
			}
		}
	}

	// Find active answer step ID
	activeAnswerStepID := ""
	for _, s := range steps {
		if s.Status == Active && s.Type == AnswerDigit {
			activeAnswerStepID = s.ID
			break
		}
	}

	// Step-based cells
	for _, step := range steps {
		isCompleted := step.Status == Completed
		isActive := step.Status == Active

		isTentative := step.Type == Carry &&
			step.LinkedStepID == activeAnswerStepID &&
			pendingFirstDigit != nil &&
			step.Status == Pending

		content := ""
		var status CellStatus
		if isCompleted {
			content = fmt.Sprintf("%d", step.CorrectValue)
			status = CellCompleted
		} else if isTentative {
			content = fmt.Sprintf("%d", *pendingFirstDigit)
			status = Tentative
		} else if showHints && isActive {
			content = fmt.Sprintf("%d", step.CorrectValue)
			status = CellActive
		} else if isActive {
			status = CellActive
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

// GetAdditionOperationLayout returns the OperationLayout for an addition problem.
func GetAdditionOperationLayout(operands []int) OperationLayout {
	layout := GetAdditionLayout(operands)
	lastOperandRow := layout.OperandRows[len(layout.OperandRows)-1]
	return OperationLayout{Rows: layout.Rows, Cols: layout.Cols, LineAfterRow: &lastOperandRow}
}

// GetAdditionStepExplanation returns a human-readable explanation for the current step.
func GetAdditionStepExplanation(operands []int, steps []StepInput, currentStepIndex int) StepExplanation {
	allDigits := make([][]int, len(operands))
	maxLen := 0
	for i, n := range operands {
		allDigits[i] = toDigits(n)
		if len(allDigits[i]) > maxLen {
			maxLen = len(allDigits[i])
		}
	}
	for i := range allDigits {
		for len(allDigits[i]) < maxLen {
			allDigits[i] = append([]int{0}, allDigits[i]...)
		}
	}

	if currentStepIndex >= len(steps) {
		sum := 0
		for _, o := range operands {
			sum += o
		}
		return StepExplanation{
			Title:  "Complete!",
			Detail: fmt.Sprintf("The answer is %d.", sum),
		}
	}

	step := steps[currentStepIndex]
	colFromRight := maxLen - (step.Position.Col - 1)
	placeNames := []string{"ones", "tens", "hundreds", "thousands", "ten-thousands"}
	placeName := fmt.Sprintf("place %d", colFromRight)
	if colFromRight-1 >= 0 && colFromRight-1 < len(placeNames) {
		placeName = placeNames[colFromRight-1]
	}

	if step.Type == Carry {
		for _, s := range steps {
			if s.ID == step.LinkedStepID {
				prevCol := maxLen - (s.Position.Col - 1)
				prevPlace := fmt.Sprintf("place %d", prevCol)
				if prevCol-1 >= 0 && prevCol-1 < len(placeNames) {
					prevPlace = placeNames[prevCol-1]
				}
				return StepExplanation{
					Title:  "Write the carry",
					Detail: fmt.Sprintf("The %s column added up to 10 or more, so carry %d to the %s column.", prevPlace, step.CorrectValue, placeName),
				}
			}
		}
		return StepExplanation{
			Title:  "Write the carry",
			Detail: fmt.Sprintf("Carry %d to the next column.", step.CorrectValue),
		}
	}

	// answer_digit
	columnDigits := make([]int, 0, len(allDigits))
	for _, d := range allDigits {
		columnDigits = append(columnDigits, d[step.Position.Col-1])
	}

	carryIn := 0
	for _, s := range steps {
		if s.Type == Carry && s.Status == Completed && s.Position.Col == step.Position.Col {
			carryIn = s.CorrectValue
			break
		}
	}

	sumStr := ""
	for i, d := range columnDigits {
		if i > 0 {
			sumStr += " + "
		}
		sumStr += fmt.Sprintf("%d", d)
	}
	if carryIn > 0 {
		sumStr += fmt.Sprintf(" + %d", carryIn)
	}

	detail := fmt.Sprintf("%s = %d", sumStr, step.CorrectValue)
	if step.CompoundValue != nil && *step.CompoundValue >= 10 {
		detail += fmt.Sprintf(" (write %d, carry %d)", step.CorrectValue, *step.CompoundValue/10)
	}

	return StepExplanation{
		Title:  fmt.Sprintf("Add the %s column", placeName),
		Detail: detail,
	}
}
