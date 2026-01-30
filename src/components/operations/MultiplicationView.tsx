import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { getMultiplicationLayout, getMultiplicationGridCells } from '../../engines/multiplication';
import { useProblemStore } from '../../stores/problemStore';

interface MultiplicationViewProps {
  errorStepId?: string | null;
}

export function MultiplicationView({ errorStepId }: MultiplicationViewProps) {
  const problemState = useProblemStore(s => s.problemState);

  const cells = useMemo(() => {
    if (!problemState) return [];
    const [a, b] = problemState.problem.operands;
    return getMultiplicationGridCells(a, b, problemState.steps);
  }, [problemState]);

  const layout = useMemo(() => {
    if (!problemState) return null;
    const [a, b] = problemState.problem.operands;
    return getMultiplicationLayout(a, b);
  }, [problemState]);

  if (!problemState || !layout) return null;

  // Line after operandB, and also before answer row if there are multiple partials
  const lineAfterRow = layout.operandBRow;

  return (
    <ColumnGrid
      cells={cells}
      cols={layout.cols}
      rows={layout.rows}
      lineAfterRow={lineAfterRow}
      currentStepIndex={problemState.currentStepIndex}
      totalSteps={problemState.steps.length}
      errorStepId={errorStepId}
    />
  );
}
