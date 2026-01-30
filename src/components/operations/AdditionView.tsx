import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { getAdditionLayout, getAdditionGridCells } from '../../engines/addition';
import { useProblemStore } from '../../stores/problemStore';

interface AdditionViewProps {
  errorStepId?: string | null;
}

export function AdditionView({ errorStepId }: AdditionViewProps) {
  const problemState = useProblemStore(s => s.problemState);

  const cells = useMemo(() => {
    if (!problemState) return [];
    const [a, b] = problemState.problem.operands;
    return getAdditionGridCells(a, b, problemState.steps);
  }, [problemState]);

  const layout = useMemo(() => {
    if (!problemState) return null;
    const [a, b] = problemState.problem.operands;
    return getAdditionLayout(a, b);
  }, [problemState]);

  if (!problemState || !layout) return null;

  return (
    <ColumnGrid
      cells={cells}
      cols={layout.cols}
      rows={layout.rows}
      lineAfterRow={layout.operandBRow}
      currentStepIndex={problemState.currentStepIndex}
      totalSteps={problemState.steps.length}
      errorStepId={errorStepId}
    />
  );
}
