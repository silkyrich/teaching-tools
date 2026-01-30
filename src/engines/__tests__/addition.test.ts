import { describe, it, expect } from 'vitest';
import { generateAdditionSteps, getAdditionLayout, getAdditionGridCells } from '../addition';

describe('generateAdditionSteps', () => {
  it('handles simple addition with no carry', () => {
    const steps = generateAdditionSteps(12, 34);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const carrySteps = steps.filter(s => s.type === 'carry');

    expect(answerSteps).toHaveLength(2);
    expect(carrySteps).toHaveLength(0);

    // Right-to-left: ones first (2+4=6), then tens (1+3=4)
    expect(answerSteps[0].correctValue).toBe(6);
    expect(answerSteps[1].correctValue).toBe(4);
  });

  it('handles addition with a carry', () => {
    const steps = generateAdditionSteps(45, 38);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const carrySteps = steps.filter(s => s.type === 'carry');

    // 5+8=13 -> answer 3, carry 1. Then 4+3+1=8
    expect(answerSteps).toHaveLength(2);
    expect(carrySteps).toHaveLength(1);

    expect(answerSteps[0].correctValue).toBe(3); // ones digit
    expect(carrySteps[0].correctValue).toBe(1);  // carry from ones
    expect(answerSteps[1].correctValue).toBe(8); // tens digit
  });

  it('handles addition with carry in every column', () => {
    const steps = generateAdditionSteps(999, 1);
    // 999+1=1000
    // ones: 9+1=10 -> answer 0, carry 1
    // tens: 9+0+1=10 -> answer 0, carry 1
    // hundreds: 9+0+1=10 -> answer 0, carry 1
    // final leading digit: 1

    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const carrySteps = steps.filter(s => s.type === 'carry');

    expect(answerSteps).toHaveLength(4); // 0, 0, 0, 1
    expect(carrySteps).toHaveLength(3);

    expect(answerSteps[0].correctValue).toBe(0);
    expect(answerSteps[1].correctValue).toBe(0);
    expect(answerSteps[2].correctValue).toBe(0);
    expect(answerSteps[3].correctValue).toBe(1); // leading carry
  });

  it('handles different length numbers', () => {
    const steps = generateAdditionSteps(5, 123);
    // 5+123=128
    const answerSteps = steps.filter(s => s.type === 'answer_digit');

    expect(answerSteps[0].correctValue).toBe(8); // 5+3
    expect(answerSteps[1].correctValue).toBe(2); // 0+2
    expect(answerSteps[2].correctValue).toBe(1); // 0+1
  });

  it('handles 347 + 185 = 532', () => {
    const steps = generateAdditionSteps(347, 185);
    const answerSteps = steps.filter(s => s.type === 'answer_digit');
    const carrySteps = steps.filter(s => s.type === 'carry');

    // ones: 7+5=12 -> answer 2, carry 1
    // tens: 4+8+1=13 -> answer 3, carry 1
    // hundreds: 3+1+1=5 -> answer 5
    expect(answerSteps).toHaveLength(3);
    expect(carrySteps).toHaveLength(2);

    expect(answerSteps[0].correctValue).toBe(2);
    expect(answerSteps[1].correctValue).toBe(3);
    expect(answerSteps[2].correctValue).toBe(5);
  });

  it('step order is answer then carry for each column', () => {
    const steps = generateAdditionSteps(45, 38);
    // ones column: answer(3) then carry(1), tens column: answer(8)
    expect(steps[0].type).toBe('answer_digit');
    expect(steps[0].correctValue).toBe(3);
    expect(steps[1].type).toBe('carry');
    expect(steps[1].correctValue).toBe(1);
    expect(steps[2].type).toBe('answer_digit');
    expect(steps[2].correctValue).toBe(8);
  });
});

describe('getAdditionLayout', () => {
  it('calculates correct dimensions for 2-digit numbers', () => {
    const layout = getAdditionLayout(45, 38);
    expect(layout.rows).toBe(4);
    expect(layout.cols).toBe(4); // 3 digit positions + 1 operator
  });

  it('calculates correct dimensions for 3-digit numbers', () => {
    const layout = getAdditionLayout(347, 185);
    expect(layout.rows).toBe(4);
    expect(layout.cols).toBe(5); // 4 digit positions + 1 operator
  });
});

describe('getAdditionGridCells', () => {
  it('returns fixed cells for operands and editable cells for steps', () => {
    const steps = generateAdditionSteps(45, 38);
    const cells = getAdditionGridCells(45, 38, steps);

    const fixedCells = cells.filter(c => c.status === 'fixed');
    const editableCells = cells.filter(c => c.editable);

    // Fixed: operator (+) + 2 digits of A + 2 digits of B = 5
    expect(fixedCells).toHaveLength(5);
    // Editable: 2 answer digits + 1 carry = 3
    expect(editableCells).toHaveLength(3);
  });
});
