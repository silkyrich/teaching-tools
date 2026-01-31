import type { StepInput, GridCell, StepExplanation, OperationLayout } from './types';

function toDigits(n: number): number[] {
  return String(n).split('').map(Number);
}

export interface AdditionLayout {
  rows: number;
  cols: number;
  operandRows: number[];
  answerRow: number;
  carryRow: number;
  operatorCol: number;
  lineRow: number;
}

export function getAdditionLayout(operands: number[]): AdditionLayout {
  const allDigits = operands.map(n => toDigits(n));
  const maxLen = Math.max(...allDigits.map(d => d.length));
  const answerLen = maxLen + 1; // possible carry
  const cols = answerLen + 1; // +1 for operator column
  const numOperands = operands.length;
  const rows = 1 + numOperands + 1; // carry + operands + answer

  const operandRows = Array.from({ length: numOperands }, (_, i) => i + 1);

  return {
    rows,
    cols,
    carryRow: 0,
    operandRows,
    answerRow: rows - 1,
    operatorCol: 0,
    lineRow: rows - 1,
  };
}

export function generateAdditionSteps(operands: number[]): StepInput[] {
  const allDigits = operands.map(n => toDigits(n));
  const maxLen = Math.max(...allDigits.map(d => d.length));

  // Pad all to equal length
  for (const d of allDigits) {
    while (d.length < maxLen) d.unshift(0);
  }

  const layout = getAdditionLayout(operands);
  const steps: StepInput[] = [];
  let carry = 0;
  let stepIndex = 0;

  // Work right-to-left through columns
  for (let i = maxLen - 1; i >= 0; i--) {
    const columnSum = allDigits.reduce((sum, d) => sum + d[i], 0) + carry;
    const answerDigit = columnSum % 10;
    const newCarry = Math.floor(columnSum / 10);

    const col = i + 1 + (layout.cols - 1 - maxLen);

    // Step: answer digit
    const answerStepId = `step-${stepIndex++}`;
    steps.push({
      id: answerStepId,
      type: 'answer_digit',
      position: { row: layout.answerRow, col, layer: 'main' },
      correctValue: answerDigit,
      enteredValue: null,
      status: 'pending',
      compoundValue: newCarry > 0 ? columnSum : undefined,
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
        linkedStepId: answerStepId,
      });
    }

    carry = newCarry;
  }

  // If there's a final carry that extends the answer (e.g. 999+1=1000)
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
  operands: number[],
  steps: StepInput[],
  showHints?: boolean,
  pendingFirstDigit?: number | null
): GridCell[] {
  const allDigits = operands.map(n => toDigits(n));
  const maxLen = Math.max(...allDigits.map(d => d.length));
  const layout = getAdditionLayout(operands);

  // Pad all to equal length
  for (const d of allDigits) {
    while (d.length < maxLen) d.unshift(0);
  }

  const cells: GridCell[] = [];

  // Operator symbol on the last operand row
  const lastOperandRow = layout.operandRows[layout.operandRows.length - 1];
  cells.push({
    row: lastOperandRow,
    col: layout.operatorCol,
    layer: 'main',
    content: '+',
    editable: false,
    status: 'fixed',
  });

  // All operand digits
  for (let opIdx = 0; opIdx < operands.length; opIdx++) {
    const d = allDigits[opIdx];
    const row = layout.operandRows[opIdx];
    for (let i = 0; i < maxLen; i++) {
      const col = i + 1 + (layout.cols - 1 - maxLen);
      if (d[i] !== 0 || i > 0) {
        cells.push({
          row,
          col,
          layer: 'main',
          content: String(d[i]),
          editable: false,
          status: 'fixed',
        });
      }
    }
  }

  // Step-based cells (answer digits and carries)
  // Build a set of active answer step IDs for tentative carry lookup
  const activeAnswerStepId = steps.find(s => s.status === 'active' && s.type === 'answer_digit')?.id;

  for (const step of steps) {
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';

    // Check if this is a carry step linked to the currently active answer step with a pending first digit
    const isTentative = step.type === 'carry'
      && step.linkedStepId === activeAnswerStepId
      && pendingFirstDigit != null
      && step.status === 'pending';

    cells.push({
      row: step.position.row,
      col: step.position.col,
      layer: step.position.layer,
      content: isCompleted ? String(step.correctValue)
             : isTentative ? String(pendingFirstDigit)
             : (showHints && isActive) ? String(step.correctValue)
             : '',
      editable: true,
      status: isTentative ? 'tentative'
             : isActive ? 'active'
             : isCompleted ? 'completed'
             : 'pending',
      type: step.type,
      stepId: step.id,
    });
  }

  return cells;
}

export function getAdditionOperationLayout(operands: number[]): OperationLayout {
  const layout = getAdditionLayout(operands);
  const lastOperandRow = layout.operandRows[layout.operandRows.length - 1];
  return { rows: layout.rows, cols: layout.cols, lineAfterRow: lastOperandRow };
}

export function getAdditionStepExplanation(
  operands: number[],
  steps: StepInput[],
  currentStepIndex: number
): StepExplanation {
  const allDigits = operands.map(n => toDigits(n));
  const maxLen = Math.max(...allDigits.map(d => d.length));
  for (const d of allDigits) {
    while (d.length < maxLen) d.unshift(0);
  }

  if (currentStepIndex >= steps.length) {
    return { title: 'Complete!', detail: `The answer is ${operands.reduce((a, b) => a + b, 0)}.` };
  }

  const step = steps[currentStepIndex];
  const colFromRight = maxLen - (step.position.col - 1);
  const placeNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  const placeName = placeNames[colFromRight - 1] || `place ${colFromRight}`;

  if (step.type === 'carry') {
    const linkedStep = steps.find(s => s.id === step.linkedStepId);
    if (linkedStep) {
      const prevCol = maxLen - (linkedStep.position.col - 1);
      const prevPlace = placeNames[prevCol - 1] || `place ${prevCol}`;
      return {
        title: `Write the carry`,
        detail: `The ${prevPlace} column added up to 10 or more, so carry ${step.correctValue} to the ${placeName} column.`,
      };
    }
    return { title: 'Write the carry', detail: `Carry ${step.correctValue} to the next column.` };
  }

  // answer_digit
  const columnDigits = allDigits.map(d => d[step.position.col - 1]);
  // Check if there was a carry into this column
  const prevCarryStep = steps.find(
    s => s.type === 'carry' && s.status === 'completed' && s.position.col === step.position.col
  );
  const carryIn = prevCarryStep ? prevCarryStep.correctValue : 0;
  const parts = columnDigits.filter(d => d !== undefined);
  const sumStr = [...parts, ...(carryIn > 0 ? [carryIn] : [])].join(' + ');

  return {
    title: `Add the ${placeName} column`,
    detail: `${sumStr} = ${step.correctValue}${step.compoundValue !== undefined && step.compoundValue >= 10 ? ` (write ${step.correctValue}, carry ${Math.floor(step.compoundValue / 10)})` : ''}`,
  };
}
