import { describe, it, expect, beforeEach } from 'vitest';
import { useProblemStore } from '../problemStore';
import { generateAdditionSteps } from '../../engines/addition';
import { generateSubtractionSteps } from '../../engines/subtraction';
import type { Problem, Difficulty } from '../../engines/types';

function makeAdditionProblem(operands: number[]): Problem {
  return {
    id: 'test',
    operation: 'addition',
    operands,
    answer: operands.reduce((a, b) => a + b, 0),
  };
}

function makeSubtractionProblem(a: number, b: number): Problem {
  return {
    id: 'test',
    operation: 'subtraction',
    operands: [a, b],
    answer: a - b,
  };
}

function start(problem: Problem, difficulty: Difficulty) {
  const steps =
    problem.operation === 'addition'
      ? generateAdditionSteps(problem.operands)
      : generateSubtractionSteps(problem.operands[0], problem.operands[1]);
  useProblemStore.getState().startProblem(problem, steps, difficulty);
}

function submit(digit: number) {
  return useProblemStore.getState().submitDigit(digit);
}

function state() {
  return useProblemStore.getState().problemState!;
}

describe('problemStore — medium addition compound entry', () => {
  beforeEach(() => useProblemStore.getState().reset());

  it('accepts two-keystroke compound entry for carry columns', () => {
    // 45 + 38 = 83. Ones: 5+8=13 → compound
    start(makeAdditionProblem([45, 38]), 'medium');

    // First keystroke: tens digit of column sum (carry value)
    expect(submit(1)).toBe('correct');
    expect(state().pendingFirstDigit).toBe(1);

    // Second keystroke: ones digit of column sum (answer digit)
    expect(submit(3)).toBe('correct');
    expect(state().pendingFirstDigit).toBeNull();

    // Answer step completed and carry auto-completed
    const steps = state().steps;
    const answerStep = steps.find(s => s.type === 'answer_digit' && s.id === 'step-0');
    const carryStep = steps.find(s => s.type === 'carry');
    expect(answerStep?.status).toBe('completed');
    expect(carryStep?.status).toBe('completed');
    expect(carryStep?.enteredValue).toBe(1);
  });

  it('rejects wrong first digit in compound entry', () => {
    start(makeAdditionProblem([45, 38]), 'medium');

    // 5+8=13, first digit should be 1
    expect(submit(2)).toBe('incorrect');
    expect(state().pendingFirstDigit).toBeNull();
  });

  it('rejects wrong second digit and clears pending', () => {
    start(makeAdditionProblem([45, 38]), 'medium');

    expect(submit(1)).toBe('correct'); // correct first digit
    expect(submit(5)).toBe('incorrect'); // wrong second digit (15 !== 13)
    expect(state().pendingFirstDigit).toBeNull();
  });

  it('skips carry step after compound entry and advances to next answer', () => {
    start(makeAdditionProblem([45, 38]), 'medium');

    // Enter compound 13 for ones column
    submit(1);
    submit(3);

    // Should now be on the tens answer step (step-2), skipping carry (step-1)
    const current = state().steps[state().currentStepIndex];
    expect(current.type).toBe('answer_digit');
    expect(current.correctValue).toBe(8); // 4+3+1=8
  });

  it('completes problem after all columns entered', () => {
    start(makeAdditionProblem([45, 38]), 'medium');

    // Ones: 5+8=13 compound
    submit(1);
    submit(3);

    // Tens: 4+3+1=8, no carry so single digit
    expect(submit(8)).toBe('correct');
    expect(state().isComplete).toBe(true);
  });

  it('handles column sum < 10 as single digit (no compound)', () => {
    // 12 + 34 = 46, no carries
    start(makeAdditionProblem([12, 34]), 'medium');

    expect(submit(6)).toBe('correct'); // ones: 2+4=6
    expect(submit(4)).toBe('correct'); // tens: 1+3=4
    expect(state().isComplete).toBe(true);
  });

  it('handles multi-column carries: 347 + 185 = 532', () => {
    start(makeAdditionProblem([347, 185]), 'medium');

    // Ones: 7+5=12 compound
    submit(1);
    submit(2);

    // Tens: 4+8+1=13 compound
    submit(1);
    submit(3);

    // Hundreds: 3+1+1=5, single digit
    expect(submit(5)).toBe('correct');
    expect(state().isComplete).toBe(true);
  });
});

describe('problemStore — medium subtraction auto-borrow', () => {
  beforeEach(() => useProblemStore.getState().reset());

  it('skips borrow step and starts on answer step', () => {
    // 83 - 45: ones column needs borrow. Steps: borrow(13) → answer(8) → answer(3)
    start(makeSubtractionProblem(83, 45), 'medium');

    // Should skip borrow step and start on the first answer step
    const current = state().steps[state().currentStepIndex];
    expect(current.type).toBe('answer_digit');
  });

  it('auto-completes borrow when answer digit is entered correctly', () => {
    start(makeSubtractionProblem(83, 45), 'medium');

    // Enter ones answer: 13-5=8
    expect(submit(8)).toBe('correct');

    // Borrow step should be auto-completed
    const borrowStep = state().steps.find(s => s.type === 'borrow');
    expect(borrowStep?.status).toBe('completed');
    expect(borrowStep?.enteredValue).toBe(borrowStep?.correctValue);
  });

  it('completes subtraction with borrow', () => {
    start(makeSubtractionProblem(83, 45), 'medium');

    submit(8); // ones: 13-5=8 (auto-borrow)
    expect(submit(3)).toBe('correct'); // tens: (8-1)-4=3
    expect(state().isComplete).toBe(true);
  });

  it('handles subtraction without borrow as single digits', () => {
    // 86 - 42 = 44, no borrows
    start(makeSubtractionProblem(86, 42), 'medium');

    expect(submit(4)).toBe('correct'); // ones: 6-2=4
    expect(submit(4)).toBe('correct'); // tens: 8-4=4
    expect(state().isComplete).toBe(true);
  });

  it('rejects wrong answer digit', () => {
    start(makeSubtractionProblem(83, 45), 'medium');

    expect(submit(5)).toBe('incorrect');
    // Borrow should NOT have been auto-completed
    const borrowStep = state().steps.find(s => s.type === 'borrow');
    expect(borrowStep?.status).not.toBe('completed');
  });
});

describe('problemStore — hard mode (no auto-complete)', () => {
  beforeEach(() => useProblemStore.getState().reset());

  it('addition: requires manual carry entry', () => {
    start(makeAdditionProblem([45, 38]), 'hard');

    // Ones: answer 3
    expect(submit(3)).toBe('correct');

    // Next step should be carry, not auto-completed
    const current = state().steps[state().currentStepIndex];
    expect(current.type).toBe('carry');
    expect(current.status).toBe('active');

    // Enter carry manually
    expect(submit(1)).toBe('correct');

    // Tens: answer 8
    expect(submit(8)).toBe('correct');
    expect(state().isComplete).toBe(true);
  });

  it('subtraction: does not skip borrow step on hard', () => {
    start(makeSubtractionProblem(83, 45), 'hard');

    // First step should be borrow (not skipped like on medium)
    const first = state().steps[state().currentStepIndex];
    expect(first.type).toBe('borrow');
    expect(first.correctValue).toBe(13);
  });

  it('subtraction without borrow works on hard', () => {
    // 86 - 42 = 44, no borrows
    start(makeSubtractionProblem(86, 42), 'hard');

    const first = state().steps[state().currentStepIndex];
    expect(first.type).toBe('answer_digit');

    expect(submit(4)).toBe('correct'); // ones: 6-2=4
    expect(submit(4)).toBe('correct'); // tens: 8-4=4
    expect(state().isComplete).toBe(true);
  });

  it('addition: wrong digit does not complete step', () => {
    start(makeAdditionProblem([45, 38]), 'hard');

    expect(submit(5)).toBe('incorrect');
    expect(state().steps[state().currentStepIndex].status).toBe('active');
    expect(state().isComplete).toBe(false);
  });
});

describe('problemStore — easy mode', () => {
  beforeEach(() => useProblemStore.getState().reset());

  it('nextStep advances and completes steps', () => {
    start(makeAdditionProblem([45, 38]), 'easy');
    const store = useProblemStore.getState();

    store.nextStep();
    expect(state().steps[0].status).toBe('completed');

    store.nextStep();
    expect(state().steps[1].status).toBe('completed');

    store.nextStep();
    expect(state().isComplete).toBe(true);
  });
});
