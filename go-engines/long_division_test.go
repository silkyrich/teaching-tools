package engines

import "testing"

func TestGenerateLongDivisionSteps_ExactDivision(t *testing.T) {
	// 96 ÷ 12 = 8
	steps := GenerateLongDivisionSteps(12, 96)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if len(answerSteps) < 2 {
		t.Fatalf("expected at least 2 answer steps, got %d", len(answerSteps))
	}
}

func TestGenerateLongDivisionSteps_DMSBCycle(t *testing.T) {
	// 84 ÷ 12 = 7
	steps := GenerateLongDivisionSteps(12, 84)

	types := make(map[StepType]bool)
	for _, s := range steps {
		types[s.Type] = true
	}
	if !types[AnswerDigit] {
		t.Error("expected answer_digit steps")
	}
	if !types[PartialProduct] {
		t.Error("expected partial_product steps")
	}
}

func TestGenerateLongDivisionSteps_WithRemainder(t *testing.T) {
	// 85 ÷ 12 = 7 r1
	steps := GenerateLongDivisionSteps(12, 85)
	remainderSteps := filterStepsByType(steps, RemainderStep)

	if len(remainderSteps) < 1 {
		t.Fatal("expected at least 1 remainder step")
	}
	if remainderSteps[0].CorrectValue != 1 {
		t.Errorf("remainder: expected 1, got %d", remainderSteps[0].CorrectValue)
	}
}

func TestGenerateLongDivisionSteps_3DigitDividend(t *testing.T) {
	// 156 ÷ 12 = 13
	steps := GenerateLongDivisionSteps(12, 156)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if len(answerSteps) < 3 {
		t.Fatalf("expected at least 3 answer steps, got %d", len(answerSteps))
	}
}
