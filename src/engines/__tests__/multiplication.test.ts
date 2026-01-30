import { describe, it, expect } from 'vitest';
import { generateMultiplicationSteps } from '../multiplication';

describe('generateMultiplicationSteps', () => {
  it('handles simple single-digit multiplier', () => {
    // 23 × 4 = 92
    const steps = generateMultiplicationSteps(23, 4);
    const partialSteps = steps.filter(s => s.type === 'partial_product');

    // Only one partial product row (single digit multiplier)
    // 3×4=12 -> digit 2, then 2×4+1=9 -> digit 9
    expect(partialSteps[0].correctValue).toBe(2); // ones: 3×4=12, digit 2
    expect(partialSteps[1].correctValue).toBe(9); // tens: 2×4+1=9
  });

  it('handles multiplication with carry', () => {
    // 47 × 6 = 282
    const steps = generateMultiplicationSteps(47, 6);
    const partialSteps = steps.filter(s => s.type === 'partial_product');

    // 7×6=42 -> digit 2, carry 4
    // 4×6+4=28 -> digit 8, carry 2
    // final carry -> 2
    expect(partialSteps[0].correctValue).toBe(2); // ones
    expect(partialSteps[1].correctValue).toBe(8); // tens
    expect(partialSteps[2].correctValue).toBe(2); // hundreds (carry)
  });

  it('handles two-digit multiplier with final answer', () => {
    // 34 × 12 = 408
    const steps = generateMultiplicationSteps(34, 12);
    const partialSteps = steps.filter(s => s.type === 'partial_product');
    const answerSteps = steps.filter(s => s.type === 'answer_digit');

    // Partial 1 (×2): 4×2=8, 3×2=6 -> 68
    // Partial 2 (×1): 4×1=4, 3×1=3 -> 340 (shifted)
    expect(partialSteps.length).toBeGreaterThanOrEqual(4);

    // Should have final answer digits
    expect(answerSteps.length).toBe(3); // 4, 0, 8
  });
});
