import type { StepInput, GridCell } from './types';

function toDigits(n: number): number[] {
  return String(n).split('').map(Number);
}

export interface MultiplicationLayout {
  rows: number;
  cols: number;
  operandARow: number;
  operandBRow: number;
  partialProductStartRow: number;
  answerRow: number;
  carryRow: number;
}

export function getMultiplicationLayout(a: number, b: number): MultiplicationLayout {
  const digitsB = toDigits(b);
  const maxProductLen = String(a * b).length;
  const cols = maxProductLen + 1; // +1 for operator column
  const numPartials = digitsB.length;

  return {
    rows: 2 + numPartials + (numPartials > 1 ? 1 : 0), // operandA, operandB, partials, answer (if >1 partial)
    cols,
    carryRow: -1, // carries shown inline
    operandARow: 0,
    operandBRow: 1,
    partialProductStartRow: 2,
    answerRow: 2 + numPartials, // only used when >1 partial
  };
}

export function generateMultiplicationSteps(a: number, b: number): StepInput[] {
  const digitsA = toDigits(a);
  const digitsB = toDigits(b);
  const layout = getMultiplicationLayout(a, b);
  const steps: StepInput[] = [];
  let stepIndex = 0;

  const partialProducts: number[] = [];

  // Generate steps for each partial product row
  for (let bIdx = digitsB.length - 1; bIdx >= 0; bIdx--) {
    const bDigit = digitsB[bIdx];
    const placeShift = digitsB.length - 1 - bIdx;
    const partialRow = layout.partialProductStartRow + (digitsB.length - 1 - bIdx);

    let carry = 0;
    const partialDigits: number[] = [];

    // Multiply right-to-left through A
    for (let aIdx = digitsA.length - 1; aIdx >= 0; aIdx--) {
      const product = digitsA[aIdx] * bDigit + carry;
      const digit = product % 10;
      carry = Math.floor(product / 10);

      const col = layout.cols - 1 - (digitsA.length - 1 - aIdx) - placeShift;

      steps.push({
        id: `step-${stepIndex++}`,
        type: 'partial_product',
        position: { row: partialRow, col, layer: 'main' },
        correctValue: digit,
        enteredValue: null,
        status: 'pending',
      });

      partialDigits.unshift(digit);
    }

    // Final carry for this partial product
    if (carry > 0) {
      const col = layout.cols - 1 - digitsA.length - placeShift;
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'partial_product',
        position: { row: partialRow, col, layer: 'main' },
        correctValue: carry,
        enteredValue: null,
        status: 'pending',
      });
      partialDigits.unshift(carry);
    }

    // Calculate the partial product value
    let partialValue = 0;
    for (const d of partialDigits) {
      partialValue = partialValue * 10 + d;
    }
    partialValue *= Math.pow(10, placeShift);
    partialProducts.push(partialValue);
  }

  // If multiple partial products, add final answer row (sum of partials)
  if (digitsB.length > 1) {
    const totalAnswer = a * b;
    const answerDigits = toDigits(totalAnswer);

    for (let i = answerDigits.length - 1; i >= 0; i--) {
      const col = layout.cols - 1 - (answerDigits.length - 1 - i);
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'answer_digit',
        position: { row: layout.answerRow, col, layer: 'main' },
        correctValue: answerDigits[i],
        enteredValue: null,
        status: 'pending',
      });
    }
  }

  return steps;
}

export function getMultiplicationGridCells(
  a: number,
  b: number,
  steps: StepInput[],
  showHints?: boolean
): GridCell[] {
  const digitsA = toDigits(a);
  const digitsB = toDigits(b);
  const layout = getMultiplicationLayout(a, b);
  const cells: GridCell[] = [];

  // Operator symbol
  cells.push({
    row: layout.operandBRow,
    col: 0,
    layer: 'main',
    content: '×',
    editable: false,
    status: 'fixed',
  });

  // Operand A digits (right-aligned)
  for (let i = 0; i < digitsA.length; i++) {
    const col = layout.cols - 1 - (digitsA.length - 1 - i);
    cells.push({
      row: layout.operandARow,
      col,
      layer: 'main',
      content: String(digitsA[i]),
      editable: false,
      status: 'fixed',
    });
  }

  // Operand B digits (right-aligned)
  for (let i = 0; i < digitsB.length; i++) {
    const col = layout.cols - 1 - (digitsB.length - 1 - i);
    cells.push({
      row: layout.operandBRow,
      col,
      layer: 'main',
      content: String(digitsB[i]),
      editable: false,
      status: 'fixed',
    });
  }

  // Step-based cells
  for (const step of steps) {
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';
    cells.push({
      row: step.position.row,
      col: step.position.col,
      layer: step.position.layer,
      content: isCompleted ? String(step.correctValue)
             : (showHints && isActive) ? String(step.correctValue)
             : '',
      editable: true,
      status: isActive ? 'active' : isCompleted ? 'completed' : 'pending',
      type: step.type,
      stepId: step.id,
    });
  }

  return cells;
}
