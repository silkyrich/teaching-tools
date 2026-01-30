import { describe, it, expect } from 'vitest';
import { generateSubtractionSteps } from '../subtraction';

describe('generateSubtractionSteps', () => {
  it('handles simple subtraction with no borrowing', () => {
    const steps = generateSubtractionSteps(89, 23);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const borrowSteps = steps.filter(s => s.type === 'borrow');

    expect(borrowSteps).toHaveLength(0);
    expect(answerSteps).toHaveLength(2);
    // Right-to-left: ones (9-3=6), tens (8-2=6)
    expect(answerSteps[0].correctValue).toBe(6);
    expect(answerSteps[1].correctValue).toBe(6);
  });

  it('handles subtraction with borrowing', () => {
    const steps = generateSubtractionSteps(52, 38);
    // 52 - 38 = 14
    // ones: 2 < 8, need to borrow -> 12 - 8 = 4
    // tens: 4 - 3 = 1
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const borrowSteps = steps.filter(s => s.type === 'borrow');

    expect(borrowSteps).toHaveLength(1);
    expect(borrowSteps[0].correctValue).toBe(12); // shows the regrouped value
    expect(answerSteps[0].correctValue).toBe(4);   // ones
    expect(answerSteps[1].correctValue).toBe(1);   // tens
  });

  it('handles 783 - 458 = 325', () => {
    const steps = generateSubtractionSteps(783, 458);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const borrowSteps = steps.filter(s => s.type === 'borrow');

    // ones: 3 < 8, borrow -> 13 - 8 = 5
    // tens: 7 (now 7) - 5 = 2... wait, 8-1=7, 7 < 5 is false, so 7-5=2
    // hundreds: 7 - 4 = 3
    expect(borrowSteps).toHaveLength(1);
    expect(answerSteps[0].correctValue).toBe(5); // ones
    expect(answerSteps[1].correctValue).toBe(2); // tens (7-5=2 after borrow reduced 8 to 7)
    expect(answerSteps[2].correctValue).toBe(3); // hundreds
  });

  it('handles subtraction with zero result', () => {
    const steps = generateSubtractionSteps(100, 100);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    expect(answerSteps[0].correctValue).toBe(0);
    expect(answerSteps[1].correctValue).toBe(0);
    expect(answerSteps[2].correctValue).toBe(0);
  });

  it('step order: borrow before answer for each column', () => {
    const steps = generateSubtractionSteps(52, 38);
    // ones column: borrow then answer
    expect(steps[0].type).toBe('borrow');
    expect(steps[1].type).toBe('answer_digit');
    expect(steps[1].correctValue).toBe(4);
    // tens column: just answer
    expect(steps[2].type).toBe('answer_digit');
    expect(steps[2].correctValue).toBe(1);
  });
});
