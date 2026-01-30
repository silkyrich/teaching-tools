import { useCallback, useState } from 'react';
import { useProblemStore } from '../stores/problemStore';
import { useUiStore } from '../stores/uiStore';

export function useStepEngine() {
  const { problemState, submitDigit, nextStep } = useProblemStore();
  const difficulty = useUiStore(s => s.difficulty);
  const [errorStepId, setErrorStepId] = useState<string | null>(null);
  const [bounceDigit, setBounceDigit] = useState<number | null>(null);

  const handleDigit = useCallback((digit: number) => {
    if (!problemState || problemState.isComplete) return;

    if (difficulty === 'easy') {
      // In easy mode, digits are shown — use Next button instead
      return;
    }

    const result = submitDigit(digit);

    if (result === 'incorrect') {
      if (difficulty === 'medium') {
        // Silent rejection — bounce the button
        setBounceDigit(digit);
        setTimeout(() => setBounceDigit(null), 300);
      } else if (difficulty === 'hard') {
        // Show error briefly
        const currentStep = problemState.steps[problemState.currentStepIndex];
        if (currentStep) {
          setErrorStepId(currentStep.id);
          setTimeout(() => {
            setErrorStepId(null);
            // Clear the entered value
            // The store will handle this on next submit
          }, 500);
        }
      }
    }
  }, [problemState, difficulty, submitDigit]);

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
    isEasyMode: difficulty === 'easy',
  };
}
