import type { StepInput, GridCell } from './types';

function toDigits(n: number): number[] {
  return String(n).split('').map(Number);
}

export interface LongDivisionLayout {
  cols: number;
  divisorCol: number;
  firstDigitCol: number;
  quotientRow: number;
  dividendRow: number;
  workStartRow: number;
}

export function getLongDivisionLayout(divisor: number, dividend: number): LongDivisionLayout {
  const dividendDigits = toDigits(dividend);
  const divisorLen = String(divisor).length;
  const cols = divisorLen + 1 + dividendDigits.length + 1; // extra col for spacing

  return {
    cols,
    divisorCol: 0,
    firstDigitCol: divisorLen + 1,
    quotientRow: 0,
    dividendRow: 1,
    workStartRow: 2,
  };
}

export function generateLongDivisionSteps(divisor: number, dividend: number): StepInput[] {
  const dividendDigits = toDigits(dividend);
  const layout = getLongDivisionLayout(divisor, dividend);
  const steps: StepInput[] = [];
  let stepIndex = 0;

  let working = 0;
  let workRow = layout.workStartRow;

  for (let i = 0; i < dividendDigits.length; i++) {
    working = working * 10 + dividendDigits[i];
    const col = layout.firstDigitCol + i;

    // Bring down step (except for first digit which is just "read")
    if (i > 0) {
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'bring_down',
        position: { row: workRow, col, layer: 'working' },
        correctValue: dividendDigits[i],
        enteredValue: null,
        status: 'pending',
      });
    }

    // Divide: quotient digit
    const quotientDigit = Math.floor(working / divisor);
    steps.push({
      id: `step-${stepIndex++}`,
      type: 'answer_digit',
      position: { row: layout.quotientRow, col, layer: 'main' },
      correctValue: quotientDigit,
      enteredValue: null,
      status: 'pending',
    });

    // Multiply: product = quotient digit × divisor
    const product = quotientDigit * divisor;
    const productDigits = toDigits(product);

    // Write product digits below working number
    for (let j = productDigits.length - 1; j >= 0; j--) {
      const pCol = col - (productDigits.length - 1 - j);
      steps.push({
        id: `step-${stepIndex++}`,
        type: 'partial_product',
        position: { row: workRow, col: pCol, layer: 'main' },
        correctValue: productDigits[j],
        enteredValue: null,
        status: 'pending',
      });
    }

    // Subtract: remainder = working - product
    const remainder = working - product;
    workRow++;

    if (i < dividendDigits.length - 1) {
      // Write remainder (which becomes the new working number)
      const remDigits = remainder === 0 ? [0] : toDigits(remainder);
      for (let j = remDigits.length - 1; j >= 0; j--) {
        const rCol = col - (remDigits.length - 1 - j);
        steps.push({
          id: `step-${stepIndex++}`,
          type: 'answer_digit',
          position: { row: workRow, col: rCol, layer: 'working' },
          correctValue: remDigits[j],
          enteredValue: null,
          status: 'pending',
        });
      }
      workRow++;
    } else {
      // Final remainder
      if (remainder > 0) {
        const remDigits = toDigits(remainder);
        for (let j = remDigits.length - 1; j >= 0; j--) {
          const rCol = col - (remDigits.length - 1 - j);
          steps.push({
            id: `step-${stepIndex++}`,
            type: 'remainder',
            position: { row: workRow, col: rCol, layer: 'working' },
            correctValue: remDigits[j],
            enteredValue: null,
            status: 'pending',
          });
        }
      }
    }

    working = remainder;
  }

  return steps;
}

export function getLongDivisionTotalRows(_divisor: number, dividend: number): number {
  const dividendDigits = toDigits(dividend);
  // quotient row + dividend row + (2 rows per digit for work: product + remainder)
  return 2 + dividendDigits.length * 2;
}

export function getLongDivisionGridCells(
  divisor: number,
  dividend: number,
  steps: StepInput[],
  showHints?: boolean
): GridCell[] {
  const dividendDigits = toDigits(dividend);
  const divisorStr = String(divisor);
  const layout = getLongDivisionLayout(divisor, dividend);
  const cells: GridCell[] = [];

  // Divisor
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

  // Bracket
  cells.push({
    row: layout.dividendRow,
    col: divisorStr.length,
    layer: 'main',
    content: ')',
    editable: false,
    status: 'fixed',
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
