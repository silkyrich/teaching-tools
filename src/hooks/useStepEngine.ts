import { useCallback, useState } from 'react';
import { useProblemStore } from '../stores/problemStore';
import { useUiStore } from '../stores/uiStore';

export function useStepEngine() {
  const { problemState, submitDigit, nextStep } = useProblemStore();
  const support = useUiStore(s => s.support);
  const [errorStepId, setErrorStepId] = useState<string | null>(null);
  const [bounceDigit, setBounceDigit] = useState<number | null>(null);

  const handleDigit = useCallback((digit: number) => {
    if (!problemState || problemState.isComplete) return;

    if (support === 'full') {
      // In full-support mode, digits are shown — use Next button instead
      return;
    }

    const result = submitDigit(digit);

    if (result === 'incorrect') {
      if (support === 'some') {
        // Silent rejection — bounce the button
        setBounceDigit(digit);
        setTimeout(() => setBounceDigit(null), 300);
      } else if (support === 'none') {
        // Show error briefly
        const currentStep = problemState.steps[problemState.currentStepIndex];
        if (currentStep) {
          setErrorStepId(currentStep.id);
          setTimeout(() => {
            setErrorStepId(null);
          }, 500);
        }
      }
    }
  }, [problemState, support, submitDigit]);

  const handleNext = useCallback(() => {
    if (!problemState || problemState.isComplete) return;
    nextStep();
  }, [problemState, nextStep]);

  return {
    problemState,
    handleDigit,
    handleNext,
    errorStepId,
    bounceDigit,
    isViewOnly: support === 'full',
  };
}
