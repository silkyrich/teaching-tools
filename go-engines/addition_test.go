package engines

import "testing"

func filterStepsByType(steps []StepInput, t StepType) []StepInput {
	var result []StepInput
	for _, s := range steps {
		if s.Type == t {
			result = append(result, s)
		}
	}
	return result
}

func TestGenerateAdditionSteps_SimpleNoCarry(t *testing.T) {
	steps := GenerateAdditionSteps([]int{12, 34})
	answerSteps := filterStepsByType(steps, AnswerDigit)
	carrySteps := filterStepsByType(steps, Carry)

	if len(answerSteps) != 2 {
		t.Fatalf("expected 2 answer steps, got %d", len(answerSteps))
	}
	if len(carrySteps) != 0 {
		t.Fatalf("expected 0 carry steps, got %d", len(carrySteps))
	}

	// Right-to-left: ones first (2+4=6), then tens (1+3=4)
	if answerSteps[0].CorrectValue != 6 {
		t.Errorf("ones digit: expected 6, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 4 {
		t.Errorf("tens digit: expected 4, got %d", answerSteps[1].CorrectValue)
	}
}

func TestGenerateAdditionSteps_WithCarry(t *testing.T) {
	steps := GenerateAdditionSteps([]int{45, 38})
	answerSteps := filterStepsByType(steps, AnswerDigit)
	carrySteps := filterStepsByType(steps, Carry)

	if len(answerSteps) != 2 {
		t.Fatalf("expected 2 answer steps, got %d", len(answerSteps))
	}
	if len(carrySteps) != 1 {
		t.Fatalf("expected 1 carry step, got %d", len(carrySteps))
	}

	// 5+8=13 -> answer 3, carry 1. Then 4+3+1=8
	if answerSteps[0].CorrectValue != 3 {
		t.Errorf("ones digit: expected 3, got %d", answerSteps[0].CorrectValue)
	}
	if carrySteps[0].CorrectValue != 1 {
		t.Errorf("carry: expected 1, got %d", carrySteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 8 {
		t.Errorf("tens digit: expected 8, got %d", answerSteps[1].CorrectValue)
	}
}

func TestGenerateAdditionSteps_CarryEveryColumn(t *testing.T) {
	steps := GenerateAdditionSteps([]int{999, 1})
	answerSteps := filterStepsByType(steps, AnswerDigit)
	carrySteps := filterStepsByType(steps, Carry)

	if len(answerSteps) != 4 {
		t.Fatalf("expected 4 answer steps, got %d", len(answerSteps))
	}
	if len(carrySteps) != 3 {
		t.Fatalf("expected 3 carry steps, got %d", len(carrySteps))
	}

	expected := []int{0, 0, 0, 1}
	for i, exp := range expected {
		if answerSteps[i].CorrectValue != exp {
			t.Errorf("answer[%d]: expected %d, got %d", i, exp, answerSteps[i].CorrectValue)
		}
	}
}

func TestGenerateAdditionSteps_DifferentLengths(t *testing.T) {
	steps := GenerateAdditionSteps([]int{5, 123})
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 8 {
		t.Errorf("ones: expected 8, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 2 {
		t.Errorf("tens: expected 2, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 1 {
		t.Errorf("hundreds: expected 1, got %d", answerSteps[2].CorrectValue)
	}
}

func TestGenerateAdditionSteps_347Plus185(t *testing.T) {
	steps := GenerateAdditionSteps([]int{347, 185})
	answerSteps := filterStepsByType(steps, AnswerDigit)
	carrySteps := filterStepsByType(steps, Carry)

	if len(answerSteps) != 3 {
		t.Fatalf("expected 3 answer steps, got %d", len(answerSteps))
	}
	if len(carrySteps) != 2 {
		t.Fatalf("expected 2 carry steps, got %d", len(carrySteps))
	}

	if answerSteps[0].CorrectValue != 2 {
		t.Errorf("ones: expected 2, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 3 {
		t.Errorf("tens: expected 3, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 5 {
		t.Errorf("hundreds: expected 5, got %d", answerSteps[2].CorrectValue)
	}
}

func TestGenerateAdditionSteps_StepOrder(t *testing.T) {
	steps := GenerateAdditionSteps([]int{45, 38})

	if steps[0].Type != AnswerDigit || steps[0].CorrectValue != 3 {
		t.Errorf("step 0: expected answer_digit=3, got %s=%d", steps[0].Type, steps[0].CorrectValue)
	}
	if steps[1].Type != Carry || steps[1].CorrectValue != 1 {
		t.Errorf("step 1: expected carry=1, got %s=%d", steps[1].Type, steps[1].CorrectValue)
	}
	if steps[2].Type != AnswerDigit || steps[2].CorrectValue != 8 {
		t.Errorf("step 2: expected answer_digit=8, got %s=%d", steps[2].Type, steps[2].CorrectValue)
	}
}

func TestGenerateAdditionSteps_LinkedStepId(t *testing.T) {
	steps := GenerateAdditionSteps([]int{45, 38})
	answerStep := steps[0]
	carryStep := steps[1]

	if carryStep.LinkedStepID != answerStep.ID {
		t.Errorf("carry step should link to answer step: expected %s, got %s", answerStep.ID, carryStep.LinkedStepID)
	}
	if answerStep.LinkedStepID != "" {
		t.Errorf("answer step should not have linkedStepId, got %s", answerStep.LinkedStepID)
	}
}

func TestGenerateAdditionSteps_CompoundValue(t *testing.T) {
	steps := GenerateAdditionSteps([]int{45, 38})
	// ones: 5+8=13, answer=3, carry=1
	if steps[0].CompoundValue == nil || *steps[0].CompoundValue != 13 {
		t.Errorf("ones step should have compoundValue 13")
	}
	// tens: 4+3+1=8, no carry
	if steps[2].CompoundValue != nil {
		t.Errorf("tens step should not have compoundValue")
	}
}

func TestGenerateAdditionSteps_NoCompoundValueWhenNoCarry(t *testing.T) {
	steps := GenerateAdditionSteps([]int{12, 34})
	for _, step := range steps {
		if step.CompoundValue != nil {
			t.Errorf("step %s should not have compoundValue", step.ID)
		}
		if step.LinkedStepID != "" {
			t.Errorf("step %s should not have linkedStepId", step.ID)
		}
	}
}

func TestMultiOperandAddition_3Operands(t *testing.T) {
	steps := GenerateAdditionSteps([]int{12, 34, 50})
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 6 {
		t.Errorf("ones: expected 6, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 9 {
		t.Errorf("tens: expected 9, got %d", answerSteps[1].CorrectValue)
	}
}

func TestMultiOperandAddition_4OperandsWithCarries(t *testing.T) {
	steps := GenerateAdditionSteps([]int{99, 99, 99, 99})
	answerSteps := filterStepsByType(steps, AnswerDigit)
	carrySteps := filterStepsByType(steps, Carry)

	if len(answerSteps) != 3 {
		t.Fatalf("expected 3 answer steps, got %d", len(answerSteps))
	}
	if answerSteps[0].CorrectValue != 6 {
		t.Errorf("ones: expected 6, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 9 {
		t.Errorf("tens: expected 9, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 3 {
		t.Errorf("leading: expected 3, got %d", answerSteps[2].CorrectValue)
	}
	if len(carrySteps) != 2 {
		t.Fatalf("expected 2 carry steps, got %d", len(carrySteps))
	}
	if carrySteps[0].CorrectValue != 3 {
		t.Errorf("carry 0: expected 3, got %d", carrySteps[0].CorrectValue)
	}
	if carrySteps[1].CorrectValue != 3 {
		t.Errorf("carry 1: expected 3, got %d", carrySteps[1].CorrectValue)
	}
}

func TestMultiOperandAddition_5Operands(t *testing.T) {
	steps := GenerateAdditionSteps([]int{10, 20, 30, 40, 50})
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 0 {
		t.Errorf("ones: expected 0, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 5 {
		t.Errorf("tens: expected 5, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 1 {
		t.Errorf("leading: expected 1, got %d", answerSteps[2].CorrectValue)
	}
}

func TestMultiOperandAddition_5OperandsLargeCarries(t *testing.T) {
	steps := GenerateAdditionSteps([]int{9, 9, 9, 9, 9})
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 5 {
		t.Errorf("ones: expected 5, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 4 {
		t.Errorf("leading: expected 4, got %d", answerSteps[1].CorrectValue)
	}
}

func TestGetAdditionLayout_2Digit(t *testing.T) {
	layout := GetAdditionLayout([]int{45, 38})
	if layout.Rows != 4 {
		t.Errorf("rows: expected 4, got %d", layout.Rows)
	}
	if layout.Cols != 4 {
		t.Errorf("cols: expected 4, got %d", layout.Cols)
	}
}

func TestGetAdditionLayout_3Digit(t *testing.T) {
	layout := GetAdditionLayout([]int{347, 185})
	if layout.Rows != 4 {
		t.Errorf("rows: expected 4, got %d", layout.Rows)
	}
	if layout.Cols != 5 {
		t.Errorf("cols: expected 5, got %d", layout.Cols)
	}
}

func TestGetAdditionLayout_3Operands(t *testing.T) {
	layout := GetAdditionLayout([]int{12, 34, 56})
	if layout.Rows != 5 {
		t.Errorf("rows: expected 5, got %d", layout.Rows)
	}
	expected := []int{1, 2, 3}
	for i, exp := range expected {
		if layout.OperandRows[i] != exp {
			t.Errorf("operandRows[%d]: expected %d, got %d", i, exp, layout.OperandRows[i])
		}
	}
	if layout.AnswerRow != 4 {
		t.Errorf("answerRow: expected 4, got %d", layout.AnswerRow)
	}
}

func TestGetAdditionLayout_5Operands(t *testing.T) {
	layout := GetAdditionLayout([]int{10, 20, 30, 40, 50})
	if layout.Rows != 7 {
		t.Errorf("rows: expected 7, got %d", layout.Rows)
	}
	expected := []int{1, 2, 3, 4, 5}
	for i, exp := range expected {
		if layout.OperandRows[i] != exp {
			t.Errorf("operandRows[%d]: expected %d, got %d", i, exp, layout.OperandRows[i])
		}
	}
	if layout.AnswerRow != 6 {
		t.Errorf("answerRow: expected 6, got %d", layout.AnswerRow)
	}
}

func TestGetAdditionGridCells(t *testing.T) {
	steps := GenerateAdditionSteps([]int{45, 38})
	cells := GetAdditionGridCells([]int{45, 38}, steps, false, nil)

	fixedCount := 0
	editableCount := 0
	for _, c := range cells {
		if c.Status == Fixed {
			fixedCount++
		}
		if c.Editable {
			editableCount++
		}
	}

	if fixedCount != 5 {
		t.Errorf("expected 5 fixed cells, got %d", fixedCount)
	}
	if editableCount != 3 {
		t.Errorf("expected 3 editable cells, got %d", editableCount)
	}
}

func TestGetAdditionGridCells_3Operands(t *testing.T) {
	steps := GenerateAdditionSteps([]int{12, 34, 56})
	cells := GetAdditionGridCells([]int{12, 34, 56}, steps, false, nil)

	fixedCount := 0
	for _, c := range cells {
		if c.Status == Fixed {
			fixedCount++
		}
	}

	if fixedCount != 7 {
		t.Errorf("expected 7 fixed cells, got %d", fixedCount)
	}
}
