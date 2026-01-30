import { describe, it, expect } from 'vitest';
import { generateShortDivisionSteps } from '../shortDivision';

describe('generateShortDivisionSteps', () => {
  it('handles exact division with no remainders', () => {
    // 84 ÷ 7 = 12
    const steps = generateShortDivisionSteps(7, 84);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const remainderSteps = steps.filter(s => s.type === 'remainder');

    expect(answerSteps).toHaveLength(2);
    expect(answerSteps[0].correctValue).toBe(1); // 8÷7 = 1
    expect(answerSteps[1].correctValue).toBe(2); // 14÷7 = 2
    expect(remainderSteps).toHaveLength(1); // carry remainder from first digit
    expect(remainderSteps[0].correctValue).toBe(1); // 8%7 = 1
  });

  it('handles 98 ÷ 7 = 14', () => {
    const steps = generateShortDivisionSteps(7, 98);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');

    expect(answerSteps[0].correctValue).toBe(1); // 9÷7 = 1
    expect(answerSteps[1].correctValue).toBe(4); // 28÷7 = 4
  });

  it('handles division with final remainder', () => {
    // 85 ÷ 7 = 12 r1
    const steps = generateShortDivisionSteps(7, 85);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const remainderSteps = steps.filter(s => s.type === 'remainder');

    expect(answerSteps[0].correctValue).toBe(1); // 8÷7 = 1
    expect(answerSteps[1].correctValue).toBe(2); // 15÷7 = 2
    // One carry remainder (from 8%7=1) and one final remainder (15%7=1)
    const finalRemainder = remainderSteps.find(s => s.label === 'r');
    expect(finalRemainder).toBeDefined();
    expect(finalRemainder!.correctValue).toBe(1);
  });

  it('handles 3-digit dividend', () => {
    // 532 ÷ 4 = 133
    const steps = generateShortDivisionSteps(4, 532);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');

    expect(answerSteps[0].correctValue).toBe(1); // 5÷4 = 1
    expect(answerSteps[1].correctValue).toBe(3); // 13÷4 = 3
    expect(answerSteps[2].correctValue).toBe(3); // 12÷4 = 3
  });

  it('handles quotient digit of 0', () => {
    // 203 ÷ 4 = 50 r3
    const steps = generateShortDivisionSteps(4, 203);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');

    expect(answerSteps[0].correctValue).toBe(0); // 2÷4 = 0
    expect(answerSteps[1].correctValue).toBe(5); // 20÷4 = 5
    expect(answerSteps[2].correctValue).toBe(0); // 3÷4 = 0
  });
});
