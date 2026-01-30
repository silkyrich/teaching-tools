import type { StepInput, GridCell } from './types';

function digits(n: number): number[] {
  return String(n).split('').map(Number);
}

export interface AdditionLayout {
  rows: number;
  cols: number;
  operandARow: number;
  operandBRow: number;
  answerRow: number;
  carryRow: number;
  operatorCol: number;
  lineRow: number;
}

export function getAdditionLayout(a: number, b: number): AdditionLayout {
  const digitsA = digits(a);
  const digitsB = digits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);
  const answerLen = maxLen + 1; // possible carry
  const cols = answerLen + 1; // +1 for operator column

  return {
    rows: 4, // carry, operandA, operandB, answer
    cols,
    carryRow: 0,
    operandARow: 1,
    operandBRow: 2,
    answerRow: 3,
    operatorCol: 0,
    lineRow: 3, // line drawn above answer row
  };
}

export function generateAdditionSteps(a: number, b: number): StepInput[] {
  const digitsA = digits(a);
  const digitsB = digits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);

  // Pad to equal length
  while (digitsA.length < maxLen) digitsA.unshift(0);
  while (digitsB.length < maxLen) digitsB.unshift(0);

  const layout = getAdditionLayout(a, b);
  const steps: StepInput[] = [];
  let carry = 0;
  let stepIndex = 0;

  // Work right-to-left through columns
  for (let i = maxLen - 1; i >= 0; i--) {
    const sum = digitsA[i] + digitsB[i] + carry;
    const answerDigit = sum % 10;
    const newCarry = Math.floor(sum / 10);

    // The column in the grid (offset by 1 for operator column, right-aligned)
    const col = i + 1 + (layout.cols - 1 - maxLen);

    // Step: answer digit
    steps.push({
      id: `step-${stepIndex++}`,
      type: 'answer_digit',
      position: { row: layout.answerRow, col, layer: 'main' },
      correctValue: answerDigit,
      enteredValue: null,
      status: 'pending',
    });

    // Step: carry digit (if needed)
    if (newCarry > 0) {
      const carryCol = col - 1;
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'carry',
        position: { row: layout.carryRow, col: carryCol, layer: 'carry' },
        correctValue: newCarry,
        enteredValue: null,
        status: 'pending',
      });
    }

    carry = newCarry;
  }

  // If there's a final carry that extends the answer (e.g. 999+1=1000)
  // The carry was already placed; we need the leading answer digit
  if (carry > 0) {
    steps.push({
      id: `step-${stepIndex++}`,
      type: 'answer_digit',
      position: { row: layout.answerRow, col: 1, layer: 'main' },
      correctValue: carry,
      enteredValue: null,
      status: 'pending',
    });
  }

  return steps;
}

export function getAdditionGridCells(
  a: number,
  b: number,
  steps: StepInput[]
): GridCell[] {
  const digitsA = digits(a);
  const digitsB = digits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);
  const layout = getAdditionLayout(a, b);

  while (digitsA.length < maxLen) digitsA.unshift(0);
  while (digitsB.length < maxLen) digitsB.unshift(0);

  const cells: GridCell[] = [];

  // Operator symbol
  cells.push({
    row: layout.operandBRow,
    col: layout.operatorCol,
    layer: 'main',
    content: '+',
    editable: false,
    status: 'fixed',
  });

  // Operand A digits
  for (let i = 0; i < maxLen; i++) {
    const col = i + 1 + (layout.cols - 1 - maxLen);
    if (digitsA[i] !== 0 || i > 0) {
      cells.push({
        row: layout.operandARow,
        col,
        layer: 'main',
        content: String(digitsA[i]),
        editable: false,
        status: 'fixed',
      });
    }
  }

  // Operand B digits
  for (let i = 0; i < maxLen; i++) {
    const col = i + 1 + (layout.cols - 1 - maxLen);
    if (digitsB[i] !== 0 || i > 0) {
      cells.push({
        row: layout.operandBRow,
        col,
        layer: 'main',
        content: String(digitsB[i]),
        editable: false,
        status: 'fixed',
      });
    }
  }

  // Step-based cells (answer digits and carries)
  for (const step of steps) {
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';
    cells.push({
      row: step.position.row,
      col: step.position.col,
      layer: step.position.layer,
      content: isCompleted ? String(step.correctValue) : '',
      editable: true,
      status: isActive ? 'active' : isCompleted ? 'completed' : 'pending',
      type: step.type,
      stepId: step.id,
    });
  }

  return cells;
}

