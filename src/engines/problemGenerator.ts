import type { Problem, Operation, Difficulty } from './types';

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
  difficulty?: Difficulty;
  operandCount?: number; // for addition: 2-5
}

function getDigitCount(config: ProblemConfig): number {
  if (config.digitCount) return config.digitCount;
  switch (config.difficulty ?? 'medium') {
    case 'easy': return 2;
    case 'medium': return 3;
    case 'hard': return 4;
  }
}

export function generateProblem(config: ProblemConfig): Problem {
  const { operation } = config;
  const digitCount = getDigitCount(config);

  switch (operation) {
    case 'addition':
      return generateAdditionProblem(digitCount, config.operandCount);
    case 'subtraction':
      return generateSubtractionProblem(digitCount);
    case 'multiplication':
      return generateMultiplicationProblem(digitCount, config.difficulty);
    case 'shortDivision':
      return generateShortDivisionProblem(digitCount, config.difficulty);
    case 'longDivision':
      return generateLongDivisionProblem(digitCount, config.difficulty);
  }
}

export function createProblemFromOperands(operation: Operation, operands: number[]): Problem {
  let answer: number;
  let remainder: number | undefined;

  switch (operation) {
    case 'addition':
      answer = operands.reduce((s, n) => s + n, 0);
      break;
    case 'subtraction':
      answer = operands[0] - operands[1];
      break;
    case 'multiplication':
      answer = operands[0] * operands[1];
      break;
    case 'shortDivision':
    case 'longDivision':
      answer = Math.floor(operands[1] / operands[0]);
      remainder = operands[1] % operands[0];
      break;
  }

  return {
    id: generateId(),
    operation,
    operands,
    answer: answer!,
    remainder,
  };
}

function generateAdditionProblem(digitCount: number, operandCount?: number): Problem {
  const min = Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  const count = operandCount ?? 2;

  const operands: number[] = [];
  for (let i = 0; i < count; i++) {
    operands.push(randomInt(min, max));
  }

  return {
    id: generateId(),
    operation: 'addition',
    operands,
    answer: operands.reduce((s, n) => s + n, 0),
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

function generateMultiplicationProblem(digitCount: number, difficulty?: Difficulty): Problem {
  const min = Math.pow(10, Math.max(1, digitCount - 1));
  const max = Math.pow(10, digitCount) - 1;
  const a = randomInt(min, max);
  const maxMultiplier = difficulty === 'easy' ? 5 : 12;
  const b = randomInt(2, maxMultiplier);

  return {
    id: generateId(),
    operation: 'multiplication',
    operands: [a, b],
    answer: a * b,
  };
}

function generateShortDivisionProblem(digitCount: number, difficulty?: Difficulty): Problem {
  const maxDivisor = difficulty === 'easy' ? 4 : 9;
  const divisor = randomInt(2, maxDivisor);
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

function generateLongDivisionProblem(digitCount: number, difficulty?: Difficulty): Problem {
  const maxDivisor = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 30 : 25;
  const divisor = randomInt(11, maxDivisor);
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
