package engines

import "fmt"

// LongDivisionLayout describes the grid layout for a long division problem.
type LongDivisionLayout struct {
	Cols         int
	DivisorCol   int
	FirstDigitCol int
	QuotientRow  int
	DividendRow  int
	WorkStartRow int
}

// GetLongDivisionLayout computes the grid layout for long division.
func GetLongDivisionLayout(divisor, dividend int) LongDivisionLayout {
	dividendDigits := toDigits(dividend)
	divisorLen := len(toDigits(divisor))
	cols := divisorLen + 1 + len(dividendDigits) + 1 // extra col for spacing

	return LongDivisionLayout{
		Cols:         cols,
		DivisorCol:   0,
		FirstDigitCol: divisorLen + 1,
		QuotientRow:  0,
		DividendRow:  1,
		WorkStartRow: 2,
	}
}

// GetLongDivisionTotalRows returns the total number of grid rows needed.
func GetLongDivisionTotalRows(dividend int) int {
	dividendDigits := toDigits(dividend)
	return 2 + len(dividendDigits)*2
}

// GenerateLongDivisionSteps generates the step-by-step solution for long division.
func GenerateLongDivisionSteps(divisor, dividend int) []StepInput {
	dividendDigits := toDigits(dividend)
	layout := GetLongDivisionLayout(divisor, dividend)
	var steps []StepInput
	stepIndex := 0

	working := 0
	workRow := layout.WorkStartRow

	for i := 0; i < len(dividendDigits); i++ {
		working = working*10 + dividendDigits[i]
		col := layout.FirstDigitCol + i

		// Bring down step (except for first digit)
		if i > 0 {
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         BringDown,
				Position:     GridPosition{Row: workRow, Col: col, Layer: LayerWorking},
				CorrectValue: dividendDigits[i],
				Status:       Pending,
			})
			stepIndex++
		}

		// Quotient digit
		quotientDigit := working / divisor
		steps = append(steps, StepInput{
			ID:           fmt.Sprintf("step-%d", stepIndex),
			Type:         AnswerDigit,
			Position:     GridPosition{Row: layout.QuotientRow, Col: col, Layer: LayerMain},
			CorrectValue: quotientDigit,
			Status:       Pending,
		})
		stepIndex++

		// Product = quotient digit × divisor
		product := quotientDigit * divisor
		productDigits := toDigits(product)

		// Write product digits below working number
		for j := len(productDigits) - 1; j >= 0; j-- {
			pCol := col - (len(productDigits) - 1 - j)
			steps = append(steps, StepInput{
				ID:           fmt.Sprintf("step-%d", stepIndex),
				Type:         PartialProduct,
				Position:     GridPosition{Row: workRow, Col: pCol, Layer: LayerMain},
				CorrectValue: productDigits[j],
				Status:       Pending,
			})
			stepIndex++
		}

		// Subtract: remainder = working - product
		remainder := working - product
		workRow++

		if i < len(dividendDigits)-1 {
			// Write remainder (becomes new working number)
			remDigits := toDigits(remainder)
			if remainder == 0 {
				remDigits = []int{0}
			}
			for j := len(remDigits) - 1; j >= 0; j-- {
				rCol := col - (len(remDigits) - 1 - j)
				steps = append(steps, StepInput{
					ID:           fmt.Sprintf("step-%d", stepIndex),
					Type:         AnswerDigit,
					Position:     GridPosition{Row: workRow, Col: rCol, Layer: LayerWorking},
					CorrectValue: remDigits[j],
					Status:       Pending,
				})
				stepIndex++
			}
			workRow++
		} else {
			// Final remainder
			if remainder > 0 {
				remDigits := toDigits(remainder)
				for j := len(remDigits) - 1; j >= 0; j-- {
					rCol := col - (len(remDigits) - 1 - j)
					steps = append(steps, StepInput{
						ID:           fmt.Sprintf("step-%d", stepIndex),
						Type:         RemainderStep,
						Position:     GridPosition{Row: workRow, Col: rCol, Layer: LayerWorking},
						CorrectValue: remDigits[j],
						Status:       Pending,
					})
					stepIndex++
				}
			}
		}

		working = remainder
	}

	return steps
}

// GetLongDivisionGridCells returns the grid cells for rendering a long division problem.
func GetLongDivisionGridCells(divisor, dividend int, steps []StepInput, showHints bool) []GridCell {
	dividendDigits := toDigits(dividend)
	divisorStr := fmt.Sprintf("%d", divisor)
	layout := GetLongDivisionLayout(divisor, dividend)
	var cells []GridCell

	// Divisor
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

// GetLongDivisionOperationLayout returns the OperationLayout for a long division problem.
func GetLongDivisionOperationLayout(operands []int) OperationLayout {
	divisor, dividend := operands[0], operands[1]
	layout := GetLongDivisionLayout(divisor, dividend)
	totalRows := GetLongDivisionTotalRows(dividend)
	return OperationLayout{Rows: totalRows, Cols: layout.Cols}
}

// GetLongDivisionStepExplanation returns a human-readable explanation for the current step.
func GetLongDivisionStepExplanation(operands []int, steps []StepInput, currentStepIndex int) StepExplanation {
	divisor, dividend := operands[0], operands[1]

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

	if step.Type == BringDown {
		return StepExplanation{
			Title:  "Bring down the next digit",
			Detail: fmt.Sprintf("Bring down %d next to the remainder to form the new working number.", step.CorrectValue),
		}
	}

	if step.Type == AnswerDigit && step.Position.Layer == LayerMain {
		return StepExplanation{
			Title:  fmt.Sprintf("How many times does %d go in?", divisor),
			Detail: fmt.Sprintf("%d goes in %d time%s. Write %d in the quotient.", divisor, step.CorrectValue, pluralS(step.CorrectValue), step.CorrectValue),
		}
	}

	if step.Type == PartialProduct {
		// Find preceding quotient digit
		var q int
		for j := currentStepIndex - 1; j >= 0; j-- {
			if steps[j].Type == AnswerDigit {
				q = steps[j].CorrectValue
				break
			}
		}
		product := q * divisor
		productDigits := toDigits(product)
		if len(productDigits) == 1 {
			return StepExplanation{
				Title:  fmt.Sprintf("Multiply %d \u00d7 %d", q, divisor),
				Detail: fmt.Sprintf("%d \u00d7 %d = %d. Write it below.", q, divisor, product),
			}
		}
		return StepExplanation{
			Title:  fmt.Sprintf("Multiply %d \u00d7 %d", q, divisor),
			Detail: fmt.Sprintf("%d \u00d7 %d = %d. Write this digit (%d) below.", q, divisor, product, step.CorrectValue),
		}
	}

	if step.Type == RemainderStep {
		return StepExplanation{
			Title:  "Write the remainder",
			Detail: fmt.Sprintf("Subtract to get the remainder: %d.", step.CorrectValue),
		}
	}

	// Working remainder (answer_digit on working layer)
	return StepExplanation{
		Title:  "Subtract",
		Detail: fmt.Sprintf("Subtract to get %d. This becomes the new working number.", step.CorrectValue),
	}
}

func pluralS(n int) string {
	if n != 1 {
		return "s"
	}
	return ""
}
