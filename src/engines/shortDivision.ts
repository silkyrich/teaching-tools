import type { StepInput, GridCell } from './types';

function digits(n: number): number[] {
  return String(n).split('').map(Number);
}

export interface ShortDivisionLayout {
  rows: number;
  cols: number;
  quotientRow: number;
  dividendRow: number;
  remainderRow: number;
  divisorCol: number;
  firstDigitCol: number;
}

export function getShortDivisionLayout(divisor: number, dividend: number): ShortDivisionLayout {
  const dividendDigits = digits(dividend);
  const divisorLen = String(divisor).length;
  // Layout: divisor | bracket | dividend digits
  // cols: divisorLen + 1(bracket) + dividendDigits.length
  const cols = divisorLen + 1 + dividendDigits.length;

  return {
    rows: 3, // quotient, dividend, carry remainders
    cols,
    quotientRow: 0,
    dividendRow: 1,
    remainderRow: 2,
    divisorCol: 0,
    firstDigitCol: divisorLen + 1,
  };
}

export function generateShortDivisionSteps(divisor: number, dividend: number): StepInput[] {
  const dividendDigits = digits(dividend);
  const layout = getShortDivisionLayout(divisor, dividend);
  const steps: StepInput[] = [];
  let stepIndex = 0;
  let carry = 0;

  // Work left-to-right through dividend digits
  for (let i = 0; i < dividendDigits.length; i++) {
    const current = carry * 10 + dividendDigits[i];
    const quotientDigit = Math.floor(current / divisor);
    const remainder = current % divisor;
    const col = layout.firstDigitCol + i;

    // Step: quotient digit
    steps.push({
      id: `step-${stepIndex++}`,
      type: 'answer_digit',
      position: { row: layout.quotientRow, col, layer: 'main' },
      correctValue: quotientDigit,
      enteredValue: null,
      status: 'pending',
    });

    // Step: remainder carry (if non-zero and not last digit)
    if (remainder > 0 && i < dividendDigits.length - 1) {
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'remainder',
        position: { row: layout.remainderRow, col, layer: 'carry' },
        correctValue: remainder,
        enteredValue: null,
        status: 'pending',
      });
    }

    // Final remainder
    if (remainder > 0 && i === dividendDigits.length - 1) {
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'remainder',
        position: { row: layout.quotientRow, col: col + 1, layer: 'main' },
        correctValue: remainder,
        enteredValue: null,
        status: 'pending',
        label: 'r',
      });
    }

    carry = remainder;
  }

  return steps;
}

export function getShortDivisionGridCells(
  divisor: number,
  dividend: number,
  steps: StepInput[]
): GridCell[] {
  const dividendDigits = digits(dividend);
  const divisorStr = String(divisor);
  const layout = getShortDivisionLayout(divisor, dividend);
  const cells: GridCell[] = [];

  // Divisor digits
  for (let i = 0; i < divisorStr.length; i++) {
    cells.push({
      row: layout.dividendRow,
      col: i,
      layer: 'main',
      content: divisorStr[i],
      editable: false,
      status: 'fixed',
    });
  }

  // Bracket column (visual separator — rendered as a special cell)
  cells.push({
    row: layout.dividendRow,
    col: divisorStr.length,
    layer: 'main',
    content: ')',
    editable: false,
    status: 'fixed',
    type: 'answer_digit',
  });

  // Dividend digits
  for (let i = 0; i < dividendDigits.length; i++) {
    cells.push({
      row: layout.dividendRow,
      col: layout.firstDigitCol + i,
      layer: 'main',
      content: String(dividendDigits[i]),
      editable: false,
      status: 'fixed',
    });
  }

  // Step-based cells (quotient digits and remainder carries)
  for (const step of steps) {
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';

    let content = '';
    if (isCompleted) {
      content = step.label === 'r'
        ? `r${step.correctValue}`
        : String(step.correctValue);
    }

    cells.push({
      row: step.position.row,
      col: step.position.col,
      layer: step.position.layer,
      content,
      editable: true,
      status: isActive ? 'active' : isCompleted ? 'completed' : 'pending',
      type: step.type,
      stepId: step.id,
    });
  }

  return cells;
}
