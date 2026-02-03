// Package addition implements the column addition method.
//
// This is the standard UK primary school method: write numbers in columns
// aligned by place value, add right-to-left, carry when a column sums to
// 10 or more.
//
// Supports 2-5 addends with any digit count.
package addition

import (
	"fmt"
	"strconv"

	"github.com/silkyrich/mathsteps/internal/engine"
	"github.com/silkyrich/mathsteps/internal/models"
)

func init() {
	engine.Register(&Engine{})
}

// Engine implements column addition.
type Engine struct{}

func (e *Engine) Name() string              { return "Column Addition" }
func (e *Engine) Operation() models.Operation { return models.Addition }

func (e *Engine) CanSolve(operands []int) bool {
	if len(operands) < 2 || len(operands) > 5 {
		return false
	}
	for _, n := range operands {
		if n < 0 {
			return false
		}
	}
	return true
}

// digits returns the individual digits of n, most significant first.
// digits(347) → [3, 4, 7]
func digits(n int) []int {
	s := strconv.Itoa(n)
	d := make([]int, len(s))
	for i, ch := range s {
		d[i] = int(ch - '0')
	}
	return d
}

// maxDigitCount returns the length of the longest operand.
func maxDigitCount(operands []int) int {
	max := 0
	for _, n := range operands {
		d := len(digits(n))
		if d > max {
			max = d
		}
	}
	return max
}

// padLeft pads a digit slice with leading zeros to length n.
func padLeft(d []int, n int) []int {
	for len(d) < n {
		d = append([]int{0}, d...)
	}
	return d
}

// layout computes the grid dimensions.
// Row 0: carries. Rows 1..N: operands. Row N+1: answer.
// Col 0: operator. Cols 1..: digit columns (padded for possible leading carry).
func layout(operands []int) (rows, cols int, operandRows []int, carryRow, answerRow int) {
	maxLen := maxDigitCount(operands)
	answerLen := maxLen + 1 // room for leading carry
	cols = answerLen + 1    // +1 for operator column

	numOperands := len(operands)
	rows = 1 + numOperands + 1 // carry row + operand rows + answer row

	operandRows = make([]int, numOperands)
	for i := range operandRows {
		operandRows[i] = i + 1
	}
	carryRow = 0
	answerRow = rows - 1
	return
}

func (e *Engine) Layout(operands []int) models.OperationLayout {
	rows, cols, operandRows, _, _ := layout(operands)
	lastOperandRow := operandRows[len(operandRows)-1]
	return models.OperationLayout{
		Rows:         rows,
		Cols:         cols,
		LineAfterRow: lastOperandRow,
	}
}

func (e *Engine) GenerateSteps(operands []int) []models.StepInput {
	maxLen := maxDigitCount(operands)
	_, cols, _, carryRow, answerRow := layout(operands)

	// Pad all operands to equal length.
	allDigits := make([][]int, len(operands))
	for i, n := range operands {
		allDigits[i] = padLeft(digits(n), maxLen)
	}

	var steps []models.StepInput
	carry := 0
	stepIdx := 0

	// Work right-to-left through columns.
	for i := maxLen - 1; i >= 0; i-- {
		colSum := carry
		for _, d := range allDigits {
			colSum += d[i]
		}

		answerDigit := colSum % 10
		newCarry := colSum / 10
		col := i + 1 + (cols - 1 - maxLen) // offset for operator column + carry padding

		answerStepID := fmt.Sprintf("step-%d", stepIdx)
		stepIdx++

		var compoundValue *int
		if newCarry > 0 {
			cv := colSum
			compoundValue = &cv
		}

		steps = append(steps, models.StepInput{
			ID:            answerStepID,
			Type:          models.StepAnswerDigit,
			Position:      models.Position{Row: answerRow, Col: col, Layer: models.LayerMain},
			CorrectValue:  answerDigit,
			Status:        models.StatusPending,
			CompoundValue: compoundValue,
		})

		if newCarry > 0 {
			carryCol := col - 1
			steps = append(steps, models.StepInput{
				ID:           fmt.Sprintf("step-%d", stepIdx),
				Type:         models.StepCarry,
				Position:     models.Position{Row: carryRow, Col: carryCol, Layer: models.LayerCarry},
				CorrectValue: newCarry,
				Status:       models.StatusPending,
				LinkedStepID: answerStepID,
			})
			stepIdx++
		}

		carry = newCarry
	}

	// Final carry that extends the answer (e.g. 999+1=1000).
	if carry > 0 {
		steps = append(steps, models.StepInput{
			ID:           fmt.Sprintf("step-%d", stepIdx),
			Type:         models.StepAnswerDigit,
			Position:     models.Position{Row: answerRow, Col: 1, Layer: models.LayerMain},
			CorrectValue: carry,
			Status:       models.StatusPending,
		})
	}

	return steps
}

func (e *Engine) Cells(operands []int, steps []models.StepInput) []models.GridCell {
	maxLen := maxDigitCount(operands)
	_, cols, operandRows, _, _ := layout(operands)

	allDigits := make([][]int, len(operands))
	for i, n := range operands {
		allDigits[i] = padLeft(digits(n), maxLen)
	}

	var cells []models.GridCell

	// Operator symbol on the last operand row.
	lastOpRow := operandRows[len(operandRows)-1]
	cells = append(cells, models.GridCell{
		Row:     lastOpRow,
		Col:     0,
		Layer:   models.LayerMain,
		Content: "+",
		Status:  models.CellFixed,
	})

	// Operand digits.
	for opIdx, d := range allDigits {
		row := operandRows[opIdx]
		for i := 0; i < maxLen; i++ {
			col := i + 1 + (cols - 1 - maxLen)
			if d[i] != 0 || i > 0 {
				cells = append(cells, models.GridCell{
					Row:     row,
					Col:     col,
					Layer:   models.LayerMain,
					Content: strconv.Itoa(d[i]),
					Status:  models.CellFixed,
				})
			}
		}
	}

	// Step-based cells (answer digits and carries).
	for _, step := range steps {
		content := ""
		status := models.CellPending

		switch step.Status {
		case models.StatusCompleted:
			content = strconv.Itoa(step.CorrectValue)
			status = models.CellCompleted
		case models.StatusActive:
			status = models.CellActive
		case models.StatusPending:
			status = models.CellPending
		}

		cells = append(cells, models.GridCell{
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

func (e *Engine) Explain(operands []int, steps []models.StepInput, stepIndex int) models.StepExplanation {
	maxLen := maxDigitCount(operands)

	allDigits := make([][]int, len(operands))
	for i, n := range operands {
		allDigits[i] = padLeft(digits(n), maxLen)
	}

	if stepIndex >= len(steps) {
		sum := 0
		for _, n := range operands {
			sum += n
		}
		return models.StepExplanation{
			Title:  "Complete!",
			Detail: fmt.Sprintf("The answer is %d.", sum),
		}
	}

	step := steps[stepIndex]
	placeNames := []string{"ones", "tens", "hundreds", "thousands", "ten-thousands"}
	colFromRight := maxLen - (step.Position.Col - 1)

	placeName := fmt.Sprintf("place %d", colFromRight)
	if colFromRight >= 1 && colFromRight <= len(placeNames) {
		placeName = placeNames[colFromRight-1]
	}

	if step.Type == models.StepCarry {
		// Find the linked answer step.
		for _, s := range steps {
			if s.ID == step.LinkedStepID {
				prevCol := maxLen - (s.Position.Col - 1)
				prevPlace := fmt.Sprintf("place %d", prevCol)
				if prevCol >= 1 && prevCol <= len(placeNames) {
					prevPlace = placeNames[prevCol-1]
				}
				return models.StepExplanation{
					Title:  "Write the carry",
					Detail: fmt.Sprintf("The %s column added up to 10 or more, so carry %d to the %s column.", prevPlace, step.CorrectValue, placeName),
				}
			}
		}
		return models.StepExplanation{
			Title:  "Write the carry",
			Detail: fmt.Sprintf("Carry %d to the next column.", step.CorrectValue),
		}
	}

	// Answer digit — describe the column sum.
	colIdx := step.Position.Col - 1
	parts := []string{}
	for _, d := range allDigits {
		if colIdx < len(d) {
			parts = append(parts, strconv.Itoa(d[colIdx]))
		}
	}

	// Check for carry into this column.
	carryIn := 0
	for _, s := range steps {
		if s.Type == models.StepCarry && s.Status == models.StatusCompleted && s.Position.Col == step.Position.Col {
			carryIn = s.CorrectValue
		}
	}
	if carryIn > 0 {
		parts = append(parts, strconv.Itoa(carryIn))
	}

	sumStr := ""
	for i, p := range parts {
		if i > 0 {
			sumStr += " + "
		}
		sumStr += p
	}

	detail := fmt.Sprintf("%s = %d", sumStr, step.CorrectValue)
	if step.CompoundValue != nil && *step.CompoundValue >= 10 {
		detail = fmt.Sprintf("%s = %d (write %d, carry %d)", sumStr, *step.CompoundValue, step.CorrectValue, *step.CompoundValue/10)
	}

	return models.StepExplanation{
		Title:  fmt.Sprintf("Add the %s column", placeName),
		Detail: detail,
	}
}
