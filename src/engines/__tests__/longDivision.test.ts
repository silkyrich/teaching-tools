import { describe, it, expect } from 'vitest';
import { generateLongDivisionSteps } from '../longDivision';

describe('generateLongDivisionSteps', () => {
  it('generates steps for exact division', () => {
    // 96 ÷ 12 = 8
    const steps = generateLongDivisionSteps(12, 96);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');

    // First digit: 9 ÷ 12 = 0
    // Then 96 ÷ 12 = 8
    expect(answerSteps.length).toBeGreaterThanOrEqual(2);
  });

  it('generates DMSB cycle steps', () => {
    // 84 ÷ 12 = 7
    const steps = generateLongDivisionSteps(12, 84);

    // Should have answer_digit, partial_product, and possibly bring_down steps
    const types = new Set(steps.map(s => s.type));
    expect(types.has('answer_digit')).toBe(true);
    expect(types.has('partial_product')).toBe(true);
  });

  it('handles division with remainder', () => {
    // 85 ÷ 12 = 7 r1
    const steps = generateLongDivisionSteps(12, 85);
    const remainderSteps = steps.filter(s => s.type === 'remainder');
    expect(remainderSteps.length).toBeGreaterThanOrEqual(1);
    expect(remainderSteps[0].correctValue).toBe(1);
  });

  it('handles 3-digit dividend', () => {
    // 156 ÷ 12 = 13
    const steps = generateLongDivisionSteps(12, 156);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    // Should have quotient digits for each position plus working remainders
    expect(answerSteps.length).toBeGreaterThanOrEqual(3);
  });
});
