import type { StepInput, GridCell } from './types';

function digits(n: number): number[] {
  return String(n).split('').map(Number);
}

export interface SubtractionLayout {
  rows: number;
  cols: number;
  operandARow: number;
  operandBRow: number;
  answerRow: number;
  borrowRow: number;
  operatorCol: number;
}

export function getSubtractionLayout(a: number, b: number): SubtractionLayout {
  const maxLen = Math.max(String(a).length, String(b).length);
  const cols = maxLen + 1; // +1 for operator column

  return {
    rows: 4, // borrow, operandA, operandB, answer
    cols,
    borrowRow: 0,
    operandARow: 1,
    operandBRow: 2,
    answerRow: 3,
    operatorCol: 0,
  };
}

export function generateSubtractionSteps(a: number, b: number): StepInput[] {
  const digitsA = digits(a);
  const digitsB = digits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);

  while (digitsA.length < maxLen) digitsA.unshift(0);
  while (digitsB.length < maxLen) digitsB.unshift(0);

  const layout = getSubtractionLayout(a, b);
  const steps: StepInput[] = [];
  let stepIndex = 0;

  // Track borrows — work through the digits to pre-compute
  const workingA = [...digitsA];
  const borrowed = new Array(maxLen).fill(false);

  // Work right-to-left
  for (let i = maxLen - 1; i >= 0; i--) {
    let topDigit = workingA[i];
    const bottomDigit = digitsB[i];
    const col = i + 1; // offset for operator column

    if (topDigit < bottomDigit) {
      // Need to borrow from next column left
      borrowed[i] = true;

      // Find a column to borrow from
      let borrowFrom = i - 1;
      while (borrowFrom >= 0 && workingA[borrowFrom] === 0) {
        borrowFrom--;
      }

      if (borrowFrom >= 0) {
        // Chain borrow through any zeros
        workingA[borrowFrom]--;
        for (let j = borrowFrom + 1; j < i; j++) {
          workingA[j] = 9; // zero becomes 9 after passing the borrow through
        }
        topDigit = workingA[i] + 10;
        workingA[i] = topDigit;
      }

      // Borrow step — will be linked to the answer step that follows
      const borrowStepId = `step-${stepIndex++}`;
      // Answer step ID is predictable (next index)
      const linkedAnswerStepId = `step-${stepIndex}`;
      steps.push({
        id: borrowStepId,
        type: 'borrow',
        position: { row: layout.borrowRow, col, layer: 'borrow' },
        correctValue: topDigit,
        enteredValue: null,
        status: 'pending',
        label: `${topDigit}`,
        linkedStepId: linkedAnswerStepId,
      });
    }

    // Answer digit
    const answerDigit = (topDigit || workingA[i]) - bottomDigit;
    steps.push({
      id: `step-${stepIndex++}`,
      type: 'answer_digit',
      position: { row: layout.answerRow, col, layer: 'main' },
      correctValue: answerDigit,
      enteredValue: null,
      status: 'pending',
    });
  }

  return steps;
}

export function getSubtractionGridCells(
  a: number,
  b: number,
  steps: StepInput[],
  showHints?: boolean
): GridCell[] {
  const digitsA = digits(a);
  const digitsB = digits(b);
  const maxLen = Math.max(digitsA.length, digitsB.length);
  const layout = getSubtractionLayout(a, b);

  while (digitsA.length < maxLen) digitsA.unshift(0);
  while (digitsB.length < maxLen) digitsB.unshift(0);

  const cells: GridCell[] = [];

  // Operator symbol
  cells.push({
    row: layout.operandBRow,
    col: layout.operatorCol,
    layer: 'main',
    content: '−',
    editable: false,
    status: 'fixed',
  });

  // Operand A digits
  for (let i = 0; i < maxLen; i++) {
    const col = i + 1;
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
    const col = i + 1;
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
