package engines

import "testing"

func TestGenerateMultiplicationSteps_SimpleSingleDigit(t *testing.T) {
	// 23 × 4 = 92
	steps := GenerateMultiplicationSteps(23, 4)
	partialSteps := filterStepsByType(steps, PartialProduct)

	// 3×4=12 -> digit 2, then 2×4+1=9 -> digit 9
	if partialSteps[0].CorrectValue != 2 {
		t.Errorf("ones: expected 2, got %d", partialSteps[0].CorrectValue)
	}
	if partialSteps[1].CorrectValue != 9 {
		t.Errorf("tens: expected 9, got %d", partialSteps[1].CorrectValue)
	}
}

func TestGenerateMultiplicationSteps_WithCarry(t *testing.T) {
	// 47 × 6 = 282
	steps := GenerateMultiplicationSteps(47, 6)
	partialSteps := filterStepsByType(steps, PartialProduct)

	// 7×6=42 -> digit 2, carry 4
	// 4×6+4=28 -> digit 8, carry 2
	// final carry -> 2
	if partialSteps[0].CorrectValue != 2 {
		t.Errorf("ones: expected 2, got %d", partialSteps[0].CorrectValue)
	}
	if partialSteps[1].CorrectValue != 8 {
		t.Errorf("tens: expected 8, got %d", partialSteps[1].CorrectValue)
	}
	if partialSteps[2].CorrectValue != 2 {
		t.Errorf("hundreds (carry): expected 2, got %d", partialSteps[2].CorrectValue)
	}
}

func TestGenerateMultiplicationSteps_TwoDigitMultiplier(t *testing.T) {
	// 34 × 12 = 408
	steps := GenerateMultiplicationSteps(34, 12)
	partialSteps := filterStepsByType(steps, PartialProduct)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if len(partialSteps) < 4 {
		t.Fatalf("expected at least 4 partial steps, got %d", len(partialSteps))
	}
	if len(answerSteps) != 3 {
		t.Fatalf("expected 3 answer steps, got %d", len(answerSteps))
	}
}
