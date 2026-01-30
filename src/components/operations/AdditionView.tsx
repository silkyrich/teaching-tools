import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { getAdditionLayout, getAdditionGridCells } from '../../engines/addition';
import { useProblemStore } from '../../stores/problemStore';
import { useUiStore } from '../../stores/uiStore';

interface AdditionViewProps {
  errorStepId?: string | null;
}

export function AdditionView({ errorStepId }: AdditionViewProps) {
  const problemState = useProblemStore(s => s.problemState);
  const support = useUiStore(s => s.support);

  const cells = useMemo(() => {
    if (!problemState) return [];
    return getAdditionGridCells(
      problemState.problem.operands,
      problemState.steps,
      support === 'full',
      support === 'some' ? problemState.pendingFirstDigit : null
    );
  }, [problemState, support]);

  const layout = useMemo(() => {
    if (!problemState) return null;
    return getAdditionLayout(problemState.problem.operands);
  }, [problemState]);

  if (!problemState || !layout) return null;

  const lastOperandRow = layout.operandRows[layout.operandRows.length - 1];

  return (
    <ColumnGrid
      cells={cells}
      cols={layout.cols}
      rows={layout.rows}
      lineAfterRow={lastOperandRow}
      currentStepIndex={problemState.currentStepIndex}
      totalSteps={problemState.steps.length}
      errorStepId={errorStepId}
    />
  );
}
