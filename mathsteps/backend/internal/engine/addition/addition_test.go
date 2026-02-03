package addition

import (
	"testing"

	"github.com/silkyrich/mathsteps/internal/models"
)

func TestCanSolve(t *testing.T) {
	e := &Engine{}

	tests := []struct {
		name     string
		operands []int
		want     bool
	}{
		{"two operands", []int{347, 285}, true},
		{"three operands", []int{10, 20, 30}, true},
		{"five operands", []int{1, 2, 3, 4, 5}, true},
		{"one operand", []int{42}, false},
		{"six operands", []int{1, 2, 3, 4, 5, 6}, false},
		{"negative operand", []int{10, -5}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := e.CanSolve(tt.operands); got != tt.want {
				t.Errorf("CanSolve(%v) = %v, want %v", tt.operands, got, tt.want)
			}
		})
	}
}

// computeAnswer sums operands. Used to verify engine correctness.
func computeAnswer(operands []int) int {
	sum := 0
	for _, n := range operands {
		sum += n
	}
	return sum
}

// extractAnswer reads the answer from completed steps.
func extractAnswer(steps []models.StepInput, operands []int) int {
	maxLen := maxDigitCount(operands)
	_, cols, _, _, answerRow := layout(operands)

	// Collect answer digits by column position.
	digitMap := map[int]int{} // col → digit
	for _, s := range steps {
		if s.Type == models.StepAnswerDigit && s.Position.Row == answerRow {
			digitMap[s.Position.Col] = s.CorrectValue
		}
	}

	// Read digits left-to-right.
	result := 0
	for col := 1; col < cols; col++ {
		if d, ok := digitMap[col]; ok {
			_ = maxLen // used in layout calculation
			result = result*10 + d
		}
	}
	return result
}

func TestSimpleAddition(t *testing.T) {
	e := &Engine{}
	operands := []int{123, 456}
	steps := e.GenerateSteps(operands)

	expected := computeAnswer(operands)
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("123 + 456: engine produced %d, expected %d", got, expected)
	}

	// No carries needed: 1+4=5, 2+5=7, 3+6=9.
	for _, s := range steps {
		if s.Type == models.StepCarry {
			t.Error("123 + 456 should not have any carries")
		}
	}
}

func TestSingleCarry(t *testing.T) {
	e := &Engine{}
	operands := []int{347, 285}
	steps := e.GenerateSteps(operands)

	expected := computeAnswer(operands) // 632
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("347 + 285: engine produced %d, expected %d", got, expected)
	}

	// Ones: 7+5=12 → carry. Tens: 4+8+1=13 → carry. Hundreds: 3+2+1=6.
	carryCount := 0
	for _, s := range steps {
		if s.Type == models.StepCarry {
			carryCount++
		}
	}
	if carryCount != 2 {
		t.Errorf("347 + 285: expected 2 carries, got %d", carryCount)
	}
}

func TestMultipleCarries(t *testing.T) {
	e := &Engine{}
	operands := []int{999, 1}
	steps := e.GenerateSteps(operands)

	expected := 1000
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("999 + 1: engine produced %d, expected %d", got, expected)
	}
}

func TestThreeOperands(t *testing.T) {
	e := &Engine{}
	operands := []int{111, 222, 333}
	steps := e.GenerateSteps(operands)

	expected := 666
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("111 + 222 + 333: engine produced %d, expected %d", got, expected)
	}
}

func TestDifferentDigitCounts(t *testing.T) {
	e := &Engine{}
	operands := []int{1234, 56}
	steps := e.GenerateSteps(operands)

	expected := 1290
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("1234 + 56: engine produced %d, expected %d", got, expected)
	}
}

func TestLargeCarry(t *testing.T) {
	e := &Engine{}
	operands := []int{9999, 9999}
	steps := e.GenerateSteps(operands)

	expected := 19998
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("9999 + 9999: engine produced %d, expected %d", got, expected)
	}
}

func TestFiveOperands(t *testing.T) {
	e := &Engine{}
	operands := []int{10, 20, 30, 40, 50}
	steps := e.GenerateSteps(operands)

	expected := 150
	got := extractAnswer(steps, operands)
	if got != expected {
		t.Errorf("10+20+30+40+50: engine produced %d, expected %d", got, expected)
	}
}

func TestStepOrder(t *testing.T) {
	e := &Engine{}
	operands := []int{347, 285}
	steps := e.GenerateSteps(operands)

	// Steps should process right-to-left. First step is ones column answer.
	if len(steps) == 0 {
		t.Fatal("no steps generated")
	}

	if steps[0].Type != models.StepAnswerDigit {
		t.Errorf("first step should be answer_digit, got %s", steps[0].Type)
	}
}

func TestLayout(t *testing.T) {
	e := &Engine{}
	layout := e.Layout([]int{347, 285})

	// 2 operands: carry row + 2 operand rows + answer row = 4 rows.
	if layout.Rows != 4 {
		t.Errorf("expected 4 rows, got %d", layout.Rows)
	}

	// 3 digits + 1 possible carry + 1 operator = 5 cols.
	if layout.Cols != 5 {
		t.Errorf("expected 5 cols, got %d", layout.Cols)
	}

	// Line after last operand row (row 2).
	if layout.LineAfterRow != 2 {
		t.Errorf("expected line after row 2, got %d", layout.LineAfterRow)
	}
}

func TestExplain(t *testing.T) {
	e := &Engine{}
	operands := []int{347, 285}
	steps := e.GenerateSteps(operands)

	// First step explanation should mention the ones column.
	exp := e.Explain(operands, steps, 0)
	if exp.Title == "" {
		t.Error("explanation title should not be empty")
	}
	if exp.Detail == "" {
		t.Error("explanation detail should not be empty")
	}
}

func TestExplainComplete(t *testing.T) {
	e := &Engine{}
	operands := []int{347, 285}
	steps := e.GenerateSteps(operands)

	exp := e.Explain(operands, steps, len(steps))
	if exp.Title != "Complete!" {
		t.Errorf("expected 'Complete!', got %q", exp.Title)
	}
}

func TestCellsContainOperands(t *testing.T) {
	e := &Engine{}
	operands := []int{34, 25}
	steps := e.GenerateSteps(operands)
	cells := e.Cells(operands, steps)

	// Should contain the operator "+".
	hasPlus := false
	for _, c := range cells {
		if c.Content == "+" {
			hasPlus = true
		}
	}
	if !hasPlus {
		t.Error("cells should contain '+' operator")
	}

	// Should contain fixed cells for operand digits.
	fixedCount := 0
	for _, c := range cells {
		if c.Status == models.CellFixed {
			fixedCount++
		}
	}
	// "34" = 2 digits, "25" = 2 digits, "+" = 1 → at least 5 fixed cells.
	if fixedCount < 5 {
		t.Errorf("expected at least 5 fixed cells, got %d", fixedCount)
	}
}
