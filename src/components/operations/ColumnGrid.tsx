import { useEffect, useRef } from 'react';
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

const CELL_SIZE = 60;

export function ColumnGrid({
  cells,
  cols,
  rows,
  lineAfterRow,
  currentStepIndex,
  totalSteps,
  errorStepId,
}: ColumnGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bring the active cell into view when the step changes
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const active = scrollEl.querySelector('[class*="active"]');
    if (!active) return;
    const wrapper = active.closest(`.${styles.cellWrapper}`) || active;
    const wrapperRect = wrapper.getBoundingClientRect();
    const scrollRect = scrollEl.getBoundingClientRect();
    const offsetLeft = wrapperRect.left - scrollRect.left + scrollEl.scrollLeft;
    // Center the active cell in the scroll viewport
    const targetScroll = offsetLeft - scrollRect.width / 2 + wrapperRect.width / 2;
    scrollEl.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }, [currentStepIndex]);

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
            <div style={{ width: CELL_SIZE - 4, height: CELL_SIZE - 4 }} />
          )}
          {r === 1 && carryCell && (carryCell.status === 'completed' || carryCell.status === 'active' || carryCell.status === 'tentative') && (
            <DigitCell cell={carryCell} showError={carryCell.stepId === errorStepId} />
          )}
        </div>
      );
    }
  }

  const cellFontSize = Math.max(14, Math.floor(CELL_SIZE * 0.45));
  const carrySize = Math.max(18, Math.floor(CELL_SIZE * 0.5));
  const carryFontSize = Math.max(10, Math.floor(CELL_SIZE * 0.28));

  return (
    <div className={styles.gridContainer}>
      <div ref={scrollRef} className={styles.scrollWrapper}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
            minWidth: cols * CELL_SIZE + (cols - 1) * 4,
            '--cell-size': `${CELL_SIZE - 4}px`,
            '--cell-font': `${cellFontSize}px`,
            '--carry-size': `${carrySize}px`,
            '--carry-font': `${carryFontSize}px`,
          } as React.CSSProperties}
        >
          {gridRows}
        </div>
      </div>
      <div className={styles.stepProgress}>
        Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
      </div>
    </div>
  );
}
