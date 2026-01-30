import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { getSubtractionLayout, getSubtractionGridCells } from '../../engines/subtraction';
import { useProblemStore } from '../../stores/problemStore';
import { useUiStore } from '../../stores/uiStore';

interface SubtractionViewProps {
  errorStepId?: string | null;
}

export function SubtractionView({ errorStepId }: SubtractionViewProps) {
  const problemState = useProblemStore(s => s.problemState);
  const difficulty = useUiStore(s => s.difficulty);

  const cells = useMemo(() => {
    if (!problemState) return [];
    const [a, b] = problemState.problem.operands;
    return getSubtractionGridCells(a, b, problemState.steps, difficulty === 'easy');
  }, [problemState, difficulty]);

  const layout = useMemo(() => {
    if (!problemState) return null;
    const [a, b] = problemState.problem.operands;
    return getSubtractionLayout(a, b);
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
