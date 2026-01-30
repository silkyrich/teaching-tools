import type { Operation, Difficulty } from '../engines/types';

const VALID_OPERATIONS: Operation[] = [
  'addition', 'subtraction', 'multiplication', 'shortDivision', 'longDivision'
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export interface UrlState {
  operation: Operation;
  operands: number[];
  difficulty?: Difficulty;
  step?: number;
}

export function parseUrlState(): UrlState | null {
  const params = new URLSearchParams(window.location.search);

  const op = params.get('op');
  const nums = params.get('nums');

  if (!op || !nums) return null;

  if (!VALID_OPERATIONS.includes(op as Operation)) return null;
  const operation = op as Operation;

  const operands = nums.split(',').map(Number);
  if (operands.some(isNaN) || operands.length < 2) return null;
  if (operands.some(n => n < 0 || !Number.isInteger(n))) return null;

  // Validate operand count per operation
  if (operation === 'addition') {
    if (operands.length < 2 || operands.length > 5) return null;
  } else {
    if (operands.length !== 2) return null;
  }

  const diffParam = params.get('d');
  const difficulty = diffParam && VALID_DIFFICULTIES.includes(diffParam as Difficulty)
    ? diffParam as Difficulty
    : undefined;

  const stepParam = params.get('step');
  const step = stepParam !== null ? parseInt(stepParam, 10) : undefined;
  if (step !== undefined && (isNaN(step) || step < 0)) return null;

  return { operation, operands, difficulty, step };
}

export function buildUrl(
  operation: Operation,
  operands: number[],
  difficulty: Difficulty,
  step: number
): string {
  const params = new URLSearchParams();
  params.set('op', operation);
  params.set('nums', operands.join(','));
  params.set('d', difficulty);
  params.set('step', String(step));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function updateUrlState(
  operation: Operation,
  operands: number[],
  difficulty: Difficulty,
  step: number
): void {
  const url = buildUrl(operation, operands, difficulty, step);
  window.history.replaceState({}, '', url);
}

export function clearUrlState(): void {
  window.history.replaceState({}, '', window.location.pathname);
}
