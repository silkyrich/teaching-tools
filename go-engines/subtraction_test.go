package engines

import "testing"

func TestGenerateSubtractionSteps_SimpleNoBorrow(t *testing.T) {
	steps := GenerateSubtractionSteps(89, 23)
	answerSteps := filterStepsByType(steps, AnswerDigit)
	borrowSteps := filterStepsByType(steps, Borrow)

	if len(borrowSteps) != 0 {
		t.Fatalf("expected 0 borrow steps, got %d", len(borrowSteps))
	}
	if len(answerSteps) != 2 {
		t.Fatalf("expected 2 answer steps, got %d", len(answerSteps))
	}
	if answerSteps[0].CorrectValue != 6 {
		t.Errorf("ones: expected 6, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 6 {
		t.Errorf("tens: expected 6, got %d", answerSteps[1].CorrectValue)
	}
}

func TestGenerateSubtractionSteps_WithBorrowing(t *testing.T) {
	steps := GenerateSubtractionSteps(52, 38)
	answerSteps := filterStepsByType(steps, AnswerDigit)
	borrowSteps := filterStepsByType(steps, Borrow)

	if len(borrowSteps) != 1 {
		t.Fatalf("expected 1 borrow step, got %d", len(borrowSteps))
	}
	if borrowSteps[0].CorrectValue != 12 {
		t.Errorf("borrow: expected 12, got %d", borrowSteps[0].CorrectValue)
	}
	if answerSteps[0].CorrectValue != 4 {
		t.Errorf("ones: expected 4, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 1 {
		t.Errorf("tens: expected 1, got %d", answerSteps[1].CorrectValue)
	}
}

func TestGenerateSubtractionSteps_783Minus458(t *testing.T) {
	steps := GenerateSubtractionSteps(783, 458)
	answerSteps := filterStepsByType(steps, AnswerDigit)
	borrowSteps := filterStepsByType(steps, Borrow)

	if len(borrowSteps) != 1 {
		t.Fatalf("expected 1 borrow step, got %d", len(borrowSteps))
	}
	if answerSteps[0].CorrectValue != 5 {
		t.Errorf("ones: expected 5, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 2 {
		t.Errorf("tens: expected 2, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 3 {
		t.Errorf("hundreds: expected 3, got %d", answerSteps[2].CorrectValue)
	}
}

func TestGenerateSubtractionSteps_ZeroResult(t *testing.T) {
	steps := GenerateSubtractionSteps(100, 100)
	answerSteps := filterStepsByType(steps, AnswerDigit)

	if answerSteps[0].CorrectValue != 0 {
		t.Errorf("ones: expected 0, got %d", answerSteps[0].CorrectValue)
	}
	if answerSteps[1].CorrectValue != 0 {
		t.Errorf("tens: expected 0, got %d", answerSteps[1].CorrectValue)
	}
	if answerSteps[2].CorrectValue != 0 {
		t.Errorf("hundreds: expected 0, got %d", answerSteps[2].CorrectValue)
	}
}

func TestGenerateSubtractionSteps_StepOrder(t *testing.T) {
	steps := GenerateSubtractionSteps(52, 38)

	if steps[0].Type != Borrow {
		t.Errorf("step 0: expected borrow, got %s", steps[0].Type)
	}
	if steps[1].Type != AnswerDigit || steps[1].CorrectValue != 4 {
		t.Errorf("step 1: expected answer_digit=4, got %s=%d", steps[1].Type, steps[1].CorrectValue)
	}
	if steps[2].Type != AnswerDigit || steps[2].CorrectValue != 1 {
		t.Errorf("step 2: expected answer_digit=1, got %s=%d", steps[2].Type, steps[2].CorrectValue)
	}
}
