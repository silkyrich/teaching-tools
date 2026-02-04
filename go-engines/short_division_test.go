package engines

import "testing"

func TestGenerateShortDivisionSteps_ExactDivision(t *testing.T) {
	// 84 ÷ 7 = 12
	steps := GenerateShortDivisionSteps(7, 84)
	answerSteps := filterStepsByType(steps, AnswerDigit)
	remainderSteps := filterStepsByType(steps, RemainderStep)

	if len(answerSteps) != 2 {
		t.Fatalf("expected 2 answer steps, got %d", len(answerSteps))
	}
	if answerSteps[0].CorrectValue != 1 {
		t.Errorf("first quotient digit: expected 1, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 2 {
		t.Errorf("second quotient digit: expected 2, got %d", answerSteps[1].CorrectValue)
	}
	if len(remainderSteps) != 1 {
		t.Fatalf("expected 1 remainder step, got %d", len(remainderSteps))
	}
	if remainderSteps[0].CorrectValue != 1 {
		t.Errorf("remainder carry: expected 1, got %d", remainderSteps[0].CorrectValue)
	}
}

func TestGenerateShortDivisionSteps_98Div7(t *testing.T) {
	steps := GenerateShortDivisionSteps(7, 98)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 1 {
		t.Errorf("first: expected 1, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 4 {
		t.Errorf("second: expected 4, got %d", answerSteps[1].CorrectValue)
	}
}

func TestGenerateShortDivisionSteps_WithFinalRemainder(t *testing.T) {
	// 85 ÷ 7 = 12 r1
	steps := GenerateShortDivisionSteps(7, 85)
	answerSteps := filterStepsByType(steps, AnswerDigit)
	remainderSteps := filterStepsByType(steps, RemainderStep)

	if answerSteps[0].CorrectValue != 1 {
		t.Errorf("first: expected 1, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 2 {
		t.Errorf("second: expected 2, got %d", answerSteps[1].CorrectValue)
	}

	var finalRemainder *StepInput
	for i := range remainderSteps {
		if remainderSteps[i].Label == "r" {
			finalRemainder = &remainderSteps[i]
			break
		}
	}
	if finalRemainder == nil {
		t.Fatal("expected a final remainder step with label 'r'")
	}
	if finalRemainder.CorrectValue != 1 {
		t.Errorf("final remainder: expected 1, got %d", finalRemainder.CorrectValue)
	}
}

func TestGenerateShortDivisionSteps_3DigitDividend(t *testing.T) {
	// 532 ÷ 4 = 133
	steps := GenerateShortDivisionSteps(4, 532)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 1 {
		t.Errorf("first: expected 1, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 3 {
		t.Errorf("second: expected 3, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 3 {
		t.Errorf("third: expected 3, got %d", answerSteps[2].CorrectValue)
	}
}

func TestGenerateShortDivisionSteps_QuotientDigitZero(t *testing.T) {
	// 203 ÷ 4 = 50 r3
	steps := GenerateShortDivisionSteps(4, 203)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 0 {
		t.Errorf("first: expected 0, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 5 {
		t.Errorf("second: expected 5, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 0 {
		t.Errorf("third: expected 0, got %d", answerSteps[2].CorrectValue)
	}
}
