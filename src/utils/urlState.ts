import type { Operation, NumberSize, Support, Difficulty } from '../engines/types';
import { difficultyToSettings } from '../engines/types';

const VALID_OPERATIONS: Operation[] = [
  'addition', 'subtraction', 'multiplication', 'shortDivision', 'longDivision'
];
const VALID_NUMBER_SIZES: NumberSize[] = ['small', 'medium', 'large'];
const VALID_SUPPORTS: Support[] = ['full', 'some', 'none'];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export interface UrlState {
  operation: Operation;
  operands: number[];
  numberSize?: NumberSize;
  support?: Support;
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

  // Parse new params (ns, sup)
  const nsParam = params.get('ns');
  const supParam = params.get('sup');
  let numberSize: NumberSize | undefined;
  let support: Support | undefined;

  if (nsParam && VALID_NUMBER_SIZES.includes(nsParam as NumberSize)) {
    numberSize = nsParam as NumberSize;
  }
  if (supParam && VALID_SUPPORTS.includes(supParam as Support)) {
    support = supParam as Support;
  }

  // Backwards compat: parse old d= param
  if (!numberSize || !support) {
    const diffParam = params.get('d');
    if (diffParam && VALID_DIFFICULTIES.includes(diffParam as Difficulty)) {
      const mapped = difficultyToSettings(diffParam as Difficulty);
      if (!numberSize) numberSize = mapped.numberSize;
      if (!support) support = mapped.support;
    }
  }

  const stepParam = params.get('step');
  const step = stepParam !== null ? parseInt(stepParam, 10) : undefined;
  if (step !== undefined && (isNaN(step) || step < 0)) return null;

  return { operation, operands, numberSize, support, step };
}

export function buildUrl(
  operation: Operation,
  operands: number[],
  numberSize: NumberSize,
  support: Support,
  step: number
): string {
  const params = new URLSearchParams();
  params.set('op', operation);
  params.set('nums', operands.join(','));
  params.set('ns', numberSize);
  params.set('sup', support);
  params.set('step', String(step));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function updateUrlState(
  operation: Operation,
  operands: number[],
  numberSize: NumberSize,
  support: Support,
  step: number
): void {
  const url = buildUrl(operation, operands, numberSize, support, step);
  window.history.replaceState({}, '', url);
}

export function clearUrlState(): void {
  window.history.replaceState({}, '', window.location.pathname);
}
