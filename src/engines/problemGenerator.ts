import type { Problem, Operation } from './types';

let nextId = 0;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return `problem-${++nextId}-${Date.now()}`;
}

export interface ProblemConfig {
  operation: Operation;
  digitCount?: number;
}

export function generateProblem(config: ProblemConfig): Problem {
  const { operation, digitCount = 3 } = config;

  switch (operation) {
    case 'addition':
      return generateAdditionProblem(digitCount);
    case 'subtraction':
      return generateSubtractionProblem(digitCount);
    case 'multiplication':
      return generateMultiplicationProblem(digitCount);
    case 'shortDivision':
      return generateShortDivisionProblem(digitCount);
    case 'longDivision':
      return generateLongDivisionProblem(digitCount);
  }
}

function generateAdditionProblem(digitCount: number): Problem {
  const min = Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  const a = randomInt(min, max);
  const b = randomInt(min, max);

  return {
    id: generateId(),
    operation: 'addition',
    operands: [a, b],
    answer: a + b,
  };
}

function generateSubtractionProblem(digitCount: number): Problem {
  const min = Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  let a = randomInt(min, max);
  let b = randomInt(min, max);
  if (b > a) [a, b] = [b, a];

  return {
    id: generateId(),
    operation: 'subtraction',
    operands: [a, b],
    answer: a - b,
  };
}

function generateMultiplicationProblem(digitCount: number): Problem {
  // For KS2: typically 2-3 digit × 1-2 digit
  const min = Math.pow(10, Math.max(1, digitCount - 1));
  const max = Math.pow(10, digitCount) - 1;
  const a = randomInt(min, max);
  const b = randomInt(2, 12); // single digit multiplier typical for KS2

  return {
    id: generateId(),
    operation: 'multiplication',
    operands: [a, b],
    answer: a * b,
  };
}

function generateShortDivisionProblem(digitCount: number): Problem {
  const divisor = randomInt(2, 9);
  const min = Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  const dividend = randomInt(min, max);

  return {
    id: generateId(),
    operation: 'shortDivision',
    operands: [divisor, dividend],
    answer: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  };
}

function generateLongDivisionProblem(digitCount: number): Problem {
  const divisor = randomInt(11, 25);
  const min = Math.pow(10, Math.max(2, digitCount - 1));
  const max = Math.pow(10, digitCount) - 1;
  const dividend = randomInt(min, max);

  return {
    id: generateId(),
    operation: 'longDivision',
    operands: [divisor, dividend],
    answer: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
  };
}
