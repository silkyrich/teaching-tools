import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ColumnGrid.module.css';
import { DigitCell } from './DigitCell';
import { RocketProgress } from './RocketProgress';
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

const MIN_CELL = 36;
const MAX_CELL = 64;
const GAP = 4;

function computeCellSize(containerWidth: number, cols: number): number {
  if (containerWidth <= 0) return MAX_CELL;
  const available = containerWidth - 32; // padding
  const size = Math.floor((available - (cols - 1) * GAP) / cols);
  return Math.max(MIN_CELL, Math.min(MAX_CELL, size));
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(MAX_CELL);

  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    setCellSize(computeCellSize(width, cols));
  }, [cols]);

  useEffect(() => {
    updateSize();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateSize]);

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

  const gridRows: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    if (lineAfterRow !== undefined && r === lineAfterRow + 1) {
      gridRows.push(
        <div key={`line-${r}`} className={styles.line} style={{ gridColumn: `1 / ${cols + 1}`, gridRow: r + 1 }} />
      );
    }

    for (let c = 0; c < cols; c++) {
      const cell = mainCells[r][c];
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

  const cellFontSize = Math.max(14, Math.floor(cellSize * 0.45));
  const carrySize = Math.max(18, Math.floor(cellSize * 0.5));
  const carryFontSize = Math.max(10, Math.floor(cellSize * 0.28));

  return (
    <div className={styles.gridContainer} ref={containerRef}>
      <div ref={scrollRef} className={styles.scrollWrapper}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            minWidth: cols * cellSize + (cols - 1) * GAP,
            '--cell-size': `${cellSize - 4}px`,
            '--cell-font': `${cellFontSize}px`,
            '--carry-size': `${carrySize}px`,
            '--carry-font': `${carryFontSize}px`,
          } as React.CSSProperties}
        >
          {gridRows}
        </div>
      </div>
      <RocketProgress current={Math.min(currentStepIndex + 1, totalSteps)} total={totalSteps} />
    </div>
  );
}
