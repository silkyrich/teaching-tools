import { useCallback, useState } from 'react';
import { useProblemStore } from '../stores/problemStore';
import { useUiStore } from '../stores/uiStore';
import { playTap, playCorrect, playError } from '../utils/sounds';
import type { BuddyMood } from '../components/buddy/LearningBuddy';

export function useStepEngine() {
  const { problemState, submitDigit, nextStep } = useProblemStore();
  const support = useUiStore(s => s.support);
  const [errorStepId, setErrorStepId] = useState<string | null>(null);
  const [bounceDigit, setBounceDigit] = useState<number | null>(null);
  const [buddyMood, setBuddyMood] = useState<BuddyMood>('idle');

  const handleDigit = useCallback((digit: number) => {
    if (!problemState || problemState.isComplete) return;

    if (support === 'full') {
      return;
    }

    playTap();
    setBuddyMood('thinking');
    const result = submitDigit(digit);

    if (result === 'incorrect') {
      playError();
      setBuddyMood('error');
      setTimeout(() => setBuddyMood('idle'), 600);

      if (support === 'some') {
        setBounceDigit(digit);
        setTimeout(() => setBounceDigit(null), 300);
      } else if (support === 'none') {
        const currentStep = problemState.steps[problemState.currentStepIndex];
        if (currentStep) {
          setErrorStepId(currentStep.id);
          setTimeout(() => {
            setErrorStepId(null);
          }, 500);
        }
      }
    } else {
      playCorrect();
      setBuddyMood('happy');
      setTimeout(() => setBuddyMood('idle'), 600);
    }
  }, [problemState, support, submitDigit]);

  const handleNext = useCallback(() => {
    if (!problemState || problemState.isComplete) return;
    playTap();
    nextStep();
    setBuddyMood('happy');
    setTimeout(() => setBuddyMood('idle'), 600);
  }, [problemState, nextStep]);

  return {
    problemState,
    handleDigit,
    handleNext,
    errorStepId,
    bounceDigit,
    buddyMood,
    isViewOnly: support === 'full',
  };
}
