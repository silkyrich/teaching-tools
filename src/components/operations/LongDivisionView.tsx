import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { getLongDivisionLayout, getLongDivisionGridCells, getLongDivisionTotalRows } from '../../engines/longDivision';
import { useProblemStore } from '../../stores/problemStore';

interface LongDivisionViewProps {
  errorStepId?: string | null;
}

export function LongDivisionView({ errorStepId }: LongDivisionViewProps) {
  const problemState = useProblemStore(s => s.problemState);

  const cells = useMemo(() => {
    if (!problemState) return [];
    const [divisor, dividend] = problemState.problem.operands;
    return getLongDivisionGridCells(divisor, dividend, problemState.steps);
  }, [problemState]);

  const layoutInfo = useMemo(() => {
    if (!problemState) return null;
    const [divisor, dividend] = problemState.problem.operands;
    const layout = getLongDivisionLayout(divisor, dividend);
    const totalRows = getLongDivisionTotalRows(divisor, dividend);
    return { ...layout, totalRows };
  }, [problemState]);

  if (!problemState || !layoutInfo) return null;

  return (
    <ColumnGrid
      cells={cells}
      cols={layoutInfo.cols}
      rows={layoutInfo.totalRows}
      lineAfterRow={undefined}
      currentStepIndex={problemState.currentStepIndex}
      totalSteps={problemState.steps.length}
      errorStepId={errorStepId}
    />
  );
}
