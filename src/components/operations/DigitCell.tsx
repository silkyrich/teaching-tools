import { useEffect, useState } from 'react';
import styles from './DigitCell.module.css';
import type { GridCell } from '../../engines/types';

interface DigitCellProps {
  cell: GridCell;
  showError?: boolean;
}

export function DigitCell({ cell, showError }: DigitCellProps) {
  const [animatingError, setAnimatingError] = useState(false);

  useEffect(() => {
    if (showError) {
      setAnimatingError(true);
      const timer = setTimeout(() => setAnimatingError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const isCarry = cell.type === 'carry' || cell.type === 'partial_carry';
  const isBorrow = cell.type === 'borrow';
  const isOperator = cell.content === '+' || cell.content === '-' || cell.content === '×' || cell.content === '÷';

  const className = [
    styles.cell,
    isCarry && styles.carry,
    isCarry && cell.status === 'active' && styles.carryActive,
    isCarry && cell.status === 'completed' && styles.carryCompleted,
    isCarry && cell.status === 'tentative' && styles.carryTentative,
    isBorrow && styles.borrow,
    isOperator && styles.operator,
    !cell.editable && !isCarry && !isBorrow && styles.fixed,
    cell.editable && !isCarry && !isBorrow && styles.editable,
    cell.status === 'pending' && cell.editable && styles.pending,
    cell.status === 'active' && !isCarry && styles.active,
    cell.status === 'completed' && cell.editable && !isCarry && styles.completed,
    cell.status === 'hidden' && styles.hidden,
    animatingError && styles.error,
  ].filter(Boolean).join(' ');

  return (
    <div className={className} data-step-id={cell.stepId}>
      {cell.content}
    </div>
  );
}
