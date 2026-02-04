package engines

import "testing"

func TestGenerateProblem_Addition(t *testing.T) {
	p := GenerateProblem(ProblemConfig{Operation: Addition, NumberSize: Small})
	if p.Operation != Addition {
		t.Errorf("expected addition, got %s", p.Operation)
	}
	if len(p.Operands) < 2 {
		t.Error("expected at least 2 operands")
	}
	sum := 0
	for _, o := range p.Operands {
		sum += o
	}
	if p.Answer != sum {
		t.Errorf("answer %d != sum %d", p.Answer, sum)
	}
}

func TestGenerateProblem_Subtraction(t *testing.T) {
	p := GenerateProblem(ProblemConfig{Operation: Subtraction, NumberSize: Medium})
	if p.Operation != Subtraction {
		t.Errorf("expected subtraction, got %s", p.Operation)
	}
	if p.Operands[0] < p.Operands[1] {
		t.Error("first operand should be >= second")
	}
	if p.Answer != p.Operands[0]-p.Operands[1] {
		t.Errorf("answer mismatch")
	}
}

func TestGenerateProblem_Multiplication(t *testing.T) {
	p := GenerateProblem(ProblemConfig{Operation: Multiplication, NumberSize: Small})
	if p.Answer != p.Operands[0]*p.Operands[1] {
		t.Errorf("answer mismatch: %d != %d * %d", p.Answer, p.Operands[0], p.Operands[1])
	}
}

func TestGenerateProblem_ShortDivision(t *testing.T) {
	p := GenerateProblem(ProblemConfig{Operation: ShortDivision, NumberSize: Small})
	if p.Answer != p.Operands[1]/p.Operands[0] {
		t.Errorf("answer mismatch")
	}
	if p.Remainder == nil {
		t.Error("expected remainder to be set")
	}
	if *p.Remainder != p.Operands[1]%p.Operands[0] {
		t.Errorf("remainder mismatch")
	}
}

func TestGenerateProblem_LongDivision(t *testing.T) {
	p := GenerateProblem(ProblemConfig{Operation: LongDivision, NumberSize: Medium})
	if p.Answer != p.Operands[1]/p.Operands[0] {
		t.Errorf("answer mismatch")
	}
}

func TestCreateProblemFromOperands_Addition(t *testing.T) {
	p := CreateProblemFromOperands(Addition, []int{10, 20, 30})
	if p.Answer != 60 {
		t.Errorf("expected 60, got %d", p.Answer)
	}
}

func TestCreateProblemFromOperands_Division(t *testing.T) {
	p := CreateProblemFromOperands(ShortDivision, []int{7, 85})
	if p.Answer != 12 {
		t.Errorf("expected 12, got %d", p.Answer)
	}
	if p.Remainder == nil || *p.Remainder != 1 {
		t.Errorf("expected remainder 1")
	}
}
