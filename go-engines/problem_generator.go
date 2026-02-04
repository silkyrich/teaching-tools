package engines

import (
	"fmt"
	"math/rand"
	"sync/atomic"
	"time"
)

var nextID int64

func generateID() string {
	id := atomic.AddInt64(&nextID, 1)
	return fmt.Sprintf("problem-%d-%d", id, time.Now().UnixMilli())
}

// ProblemConfig configures problem generation.
type ProblemConfig struct {
	Operation    Operation
	DigitCount   int
	NumberSize   NumberSize
	OperandCount int // for addition: 2-5
}

func getDigitCount(config ProblemConfig) int {
	if config.DigitCount > 0 {
		return config.DigitCount
	}
	size := config.NumberSize
	if size == "" {
		size = Medium
	}
	switch size {
	case Small:
		return 2
	case Medium:
		return 3
	case Large:
		return 4
	default:
		return 3
	}
}

func randomInt(min, max int) int {
	return min + rand.Intn(max-min+1)
}

// GenerateProblem generates a random math problem based on the config.
func GenerateProblem(config ProblemConfig) Problem {
	digitCount := getDigitCount(config)

	switch config.Operation {
	case Addition:
		return generateAdditionProblem(digitCount, config.OperandCount)
	case Subtraction:
		return generateSubtractionProblem(digitCount)
	case Multiplication:
		return generateMultiplicationProblem(digitCount, config.NumberSize)
	case ShortDivision:
		return generateShortDivisionProblem(digitCount, config.NumberSize)
	case LongDivision:
		return generateLongDivisionProblem(digitCount, config.NumberSize)
	default:
		return generateAdditionProblem(digitCount, config.OperandCount)
	}
}

// CreateProblemFromOperands creates a Problem from given operands.
func CreateProblemFromOperands(operation Operation, operands []int) Problem {
	var answer int
	var remainder *int

	switch operation {
	case Addition:
		for _, n := range operands {
			answer += n
		}
	case Subtraction:
		answer = operands[0] - operands[1]
	case Multiplication:
		answer = operands[0] * operands[1]
	case ShortDivision, LongDivision:
		answer = operands[1] / operands[0]
		r := operands[1] % operands[0]
		remainder = &r
	}

	return Problem{
		ID:        generateID(),
		Operation: operation,
		Operands:  operands,
		Answer:    answer,
		Remainder: remainder,
	}
}

func generateAdditionProblem(digitCount, operandCount int) Problem {
	min := intPow(10, digitCount-1)
	max := intPow(10, digitCount) - 1
	count := operandCount
	if count < 2 {
		count = 2
	}

	operands := make([]int, count)
	answer := 0
	for i := 0; i < count; i++ {
		operands[i] = randomInt(min, max)
		answer += operands[i]
	}

	return Problem{
		ID:        generateID(),
		Operation: Addition,
		Operands:  operands,
		Answer:    answer,
	}
}

func generateSubtractionProblem(digitCount int) Problem {
	min := intPow(10, digitCount-1)
	max := intPow(10, digitCount) - 1
	a := randomInt(min, max)
	b := randomInt(min, max)
	if b > a {
		a, b = b, a
	}

	return Problem{
		ID:        generateID(),
		Operation: Subtraction,
		Operands:  []int{a, b},
		Answer:    a - b,
	}
}

func generateMultiplicationProblem(digitCount int, numberSize NumberSize) Problem {
	min := intPow(10, maxInt(1, digitCount-1))
	max := intPow(10, digitCount) - 1
	a := randomInt(min, max)

	maxMultiplier := 12
	minMultiplier := 2
	switch numberSize {
	case Small:
		maxMultiplier = 5
	case Large:
		maxMultiplier = 20
		minMultiplier = 5
	}
	b := randomInt(minMultiplier, maxMultiplier)

	return Problem{
		ID:        generateID(),
		Operation: Multiplication,
		Operands:  []int{a, b},
		Answer:    a * b,
	}
}

func generateShortDivisionProblem(digitCount int, numberSize NumberSize) Problem {
	maxDivisor := 9
	switch numberSize {
	case Small:
		maxDivisor = 4
	case Large:
		maxDivisor = 12
	}
	divisor := randomInt(2, maxDivisor)
	min := intPow(10, digitCount-1)
	max := intPow(10, digitCount) - 1
	dividend := randomInt(min, max)

	r := dividend % divisor
	return Problem{
		ID:        generateID(),
		Operation: ShortDivision,
		Operands:  []int{divisor, dividend},
		Answer:    dividend / divisor,
		Remainder: &r,
	}
}

func generateLongDivisionProblem(digitCount int, numberSize NumberSize) Problem {
	maxDivisor := 25
	switch numberSize {
	case Small:
		maxDivisor = 15
	case Large:
		maxDivisor = 30
	}
	divisor := randomInt(11, maxDivisor)
	min := intPow(10, maxInt(2, digitCount-1))
	max := intPow(10, digitCount) - 1
	dividend := randomInt(min, max)

	r := dividend % divisor
	return Problem{
		ID:        generateID(),
		Operation: LongDivision,
		Operands:  []int{divisor, dividend},
		Answer:    dividend / divisor,
		Remainder: &r,
	}
}
