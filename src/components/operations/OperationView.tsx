import { useMemo } from 'react';
import { ColumnGrid } from './ColumnGrid';
import { operationRegistry } from '../../engines/operationRegistry';
import { useProblemStore } from '../../stores/problemStore';
import { useUiStore } from '../../stores/uiStore';
import type { StepExplanation } from '../../engines/types';

interface OperationViewProps {
  errorStepId?: string | null;
}

export function OperationView({ errorStepId }: OperationViewProps) {
  const problemState = useProblemStore(s => s.problemState);
  const support = useUiStore(s => s.support);

  const config = problemState
    ? operationRegistry[problemState.problem.operation]
    : null;

  const cells = useMemo(() => {
    if (!problemState || !config) return [];
    return config.getCells(
      problemState.problem.operands,
      problemState.steps,
      support === 'full',
      support === 'some' ? problemState.pendingFirstDigit : null
    );
  }, [problemState, support, config]);

  const layout = useMemo(() => {
    if (!problemState || !config) return null;
    return config.getLayout(problemState.problem.operands);
  }, [problemState, config]);

  if (!problemState || !layout || !config) return null;

  return (
    <ColumnGrid
      cells={cells}
      cols={layout.cols}
      rows={layout.rows}
      lineAfterRow={layout.lineAfterRow}
      currentStepIndex={problemState.currentStepIndex}
      totalSteps={problemState.steps.length}
      errorStepId={errorStepId}
    />
  );
}

export function useStepExplanation(): StepExplanation | null {
  const problemState = useProblemStore(s => s.problemState);

  return useMemo(() => {
    if (!problemState) return null;
    const config = operationRegistry[problemState.problem.operation];
    return config.getStepExplanation(
      problemState.problem.operands,
      problemState.steps,
      problemState.currentStepIndex
    );
  }, [problemState]);
}
