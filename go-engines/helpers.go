package engines

import "strconv"

// toDigits splits a non-negative integer into its individual digits.
func toDigits(n int) []int {
	s := strconv.Itoa(n)
	digits := make([]int, len(s))
	for i, ch := range s {
		digits[i] = int(ch - '0')
	}
	return digits
}

// intPow returns base^exp for non-negative exponents.
func intPow(base, exp int) int {
	result := 1
	for i := 0; i < exp; i++ {
		result *= base
	}
	return result
}

// maxInt returns the larger of two ints.
func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// intPtr returns a pointer to an int value.
func intPtr(v int) *int {
	return &v
}
