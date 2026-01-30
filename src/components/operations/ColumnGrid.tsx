import styles from './ColumnGrid.module.css';
import { DigitCell } from './DigitCell';
import type { GridCell } from '../../engines/types';

interface ColumnGridProps {
  cells: GridCell[];
  cols: number;
  rows: number;
  lineAfterRow?: number;
  currentStepIndex: number;
  totalSteps: number;
  errorStepId?: string | null;
}

export function ColumnGrid({
  cells,
  cols,
  rows,
  lineAfterRow,
  currentStepIndex,
  totalSteps,
  errorStepId,
}: ColumnGridProps) {
  // Build a 2D map for positioning, separating main and carry layers
  const mainCells: (GridCell | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );
  const carryCells: GridCell[] = [];

  for (const cell of cells) {
    if (cell.layer === 'carry' || cell.type === 'carry' || cell.type === 'partial_carry') {
      carryCells.push(cell);
    } else {
      if (cell.row >= 0 && cell.row < rows && cell.col >= 0 && cell.col < cols) {
        mainCells[cell.row][cell.col] = cell;
      }
    }
  }

  // Render grid rows, inserting line where needed
  const gridRows: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    if (lineAfterRow !== undefined && r === lineAfterRow + 1) {
      gridRows.push(
        <div key={`line-${r}`} className={styles.line} style={{ gridColumn: `1 / ${cols + 1}`, gridRow: r + 1 }} />
      );
    }

    for (let c = 0; c < cols; c++) {
      const cell = mainCells[r][c];
      // Find any carry cell that overlaps this position
      const carryCell = carryCells.find(
        cc => cc.col === c && cc.row === 0
      );

      gridRows.push(
        <div
          key={`${r}-${c}`}
          className={styles.cellWrapper}
          style={{ gridRow: r + 1, gridColumn: c + 1 }}
        >
          {cell ? (
            <DigitCell cell={cell} showError={cell.stepId === errorStepId} />
          ) : (
            <div style={{ width: 56, height: 56 }} />
          )}
          {r === 1 && carryCell && (carryCell.status === 'completed' || carryCell.status === 'active' || carryCell.status === 'tentative') && (
            <DigitCell cell={carryCell} showError={carryCell.stepId === errorStepId} />
          )}
        </div>
      );
    }
  }

  return (
    <div className={styles.gridContainer}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${cols}, 60px)`,
          gridTemplateRows: `repeat(${rows}, 60px)`,
        }}
      >
        {gridRows}
      </div>
      <div className={styles.stepProgress}>
        Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
      </div>
    </div>
  );
}
