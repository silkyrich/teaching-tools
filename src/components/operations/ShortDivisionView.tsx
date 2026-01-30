import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { getShortDivisionLayout, getShortDivisionGridCells } from '../../engines/shortDivision';
import { useProblemStore } from '../../stores/problemStore';

interface ShortDivisionViewProps {
  errorStepId?: string | null;
}

export function ShortDivisionView({ errorStepId }: ShortDivisionViewProps) {
  const problemState = useProblemStore(s => s.problemState);

  const cells = useMemo(() => {
    if (!problemState) return [];
    const [divisor, dividend] = problemState.problem.operands;
    return getShortDivisionGridCells(divisor, dividend, problemState.steps);
  }, [problemState]);

  const layout = useMemo(() => {
    if (!problemState) return null;
    const [divisor, dividend] = problemState.problem.operands;
    return getShortDivisionLayout(divisor, dividend);
  }, [problemState]);

  if (!problemState || !layout) return null;

  return (
    <ColumnGrid
      cells={cells}
      cols={layout.cols}
      rows={layout.rows}
      lineAfterRow={undefined}
      currentStepIndex={problemState.currentStepIndex}
      totalSteps={problemState.steps.length}
      errorStepId={errorStepId}
    />
  );
}
