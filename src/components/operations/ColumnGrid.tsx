import { useMemo } from 'react';
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
  // Compute responsive cell size: fit cols within available width (max 60px)
  const cellSize = useMemo(() => {
    const maxWidth = Math.min(window.innerWidth - 40, 600); // 20px padding each side
    const gap = 4;
    const available = maxWidth - gap * (cols - 1);
    return Math.min(60, Math.floor(available / cols));
  }, [cols]);

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
            <div style={{ width: cellSize - 4, height: cellSize - 4 }} />
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
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          '--cell-size': `${cellSize - 4}px`,
          '--cell-font': `${Math.max(16, Math.floor(cellSize * 0.45))}px`,
          '--carry-size': `${Math.max(22, Math.floor(cellSize * 0.5))}px`,
          '--carry-font': `${Math.max(12, Math.floor(cellSize * 0.28))}px`,
        } as React.CSSProperties}
      >
        {gridRows}
      </div>
      <div className={styles.stepProgress}>
        Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
      </div>
    </div>
  );
}
