import { create } from 'zustand';
import type { Problem, ProblemState, StepInput, Support } from '../engines/types';

interface ProblemStore {
  problemState: ProblemState | null;
  startProblem: (problem: Problem, steps: StepInput[], support: Support) => void;
  startProblemAtStep: (problem: Problem, steps: StepInput[], support: Support, stepIndex: number) => void;
  submitDigit: (digit: number) => 'correct' | 'incorrect' | 'ignored';
  nextStep: () => void;
  reset: () => void;
}

function findNextActiveIndex(steps: StepInput[], fromIndex: number, support: Support): number {
  let idx = fromIndex + 1;
  // On 'some' support, skip borrow steps (they auto-complete when the linked answer is entered)
  if (support === 'some') {
    while (idx < steps.length && steps[idx].type === 'borrow' && steps[idx].linkedStepId) {
      idx++;
    }
  }
  return idx;
}

function advanceToNext(state: ProblemState, newSteps: StepInput[], fromIndex: number): ProblemState {
  const nextIndex = findNextActiveIndex(newSteps, fromIndex, state.support);
  const isComplete = nextIndex >= newSteps.length;

  if (!isComplete && newSteps[nextIndex]) {
    newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'active' };
  }

  return {
    ...state,
    steps: newSteps,
    currentStepIndex: isComplete ? fromIndex : nextIndex,
    isComplete,
    completedAt: isComplete ? Date.now() : null,
    pendingFirstDigit: null,
  };
}

function completeLinkedSteps(
  newSteps: StepInput[],
  completedStepId: string,
  currentIndex: number
): number {
  // Auto-complete any steps linked to the completed step
  // For addition: carry step has linkedStepId pointing to the answer step
  // For subtraction: borrow step has linkedStepId pointing to the answer step
  let skipped = 0;
  for (let i = currentIndex + 1; i < newSteps.length; i++) {
    const step = newSteps[i];
    if (step.linkedStepId === completedStepId && step.status !== 'completed') {
      newSteps[i] = {
        ...step,
        enteredValue: step.correctValue,
        status: 'completed',
      };
      skipped++;
    } else {
      break; // Only auto-complete immediately following linked steps
    }
  }

  // Also check steps before currentIndex (for subtraction where borrow precedes answer)
  for (let i = currentIndex - 1; i >= 0; i--) {
    const step = newSteps[i];
    if (step.linkedStepId === completedStepId && step.status !== 'completed') {
      newSteps[i] = {
        ...step,
        enteredValue: step.correctValue,
        status: 'completed',
      };
    }
  }

  return skipped;
}

export const useProblemStore = create<ProblemStore>((set, get) => ({
  problemState: null,

  startProblem: (problem, steps, support) => {
    // On 'some' support, find the first non-borrow step to activate
    let firstActiveIndex = 0;
    if (support === 'some') {
      while (firstActiveIndex < steps.length && steps[firstActiveIndex].type === 'borrow' && steps[firstActiveIndex].linkedStepId) {
        firstActiveIndex++;
      }
    }

    const initialSteps = steps.map((s, i) => ({
      ...s,
      status: (i === firstActiveIndex ? 'active' : 'pending') as StepInput['status'],
      enteredValue: null,
    }));

    set({
      problemState: {
        problem,
        support,
        steps: initialSteps,
        currentStepIndex: firstActiveIndex,
        isComplete: false,
        startedAt: Date.now(),
        completedAt: null,
        pendingFirstDigit: null,
      },
    });
  },

  startProblemAtStep: (problem, steps, support, stepIndex) => {
    const clampedIndex = Math.min(stepIndex, steps.length);
    const isComplete = clampedIndex >= steps.length;

    const initialSteps = steps.map((s, i) => ({
      ...s,
      status: (i < clampedIndex ? 'completed'
             : i === clampedIndex && !isComplete ? 'active'
             : 'pending') as StepInput['status'],
      enteredValue: i < clampedIndex ? s.correctValue : null,
    }));

    set({
      problemState: {
        problem,
        support,
        steps: initialSteps,
        currentStepIndex: isComplete ? clampedIndex - 1 : clampedIndex,
        isComplete,
        startedAt: Date.now(),
        completedAt: isComplete ? Date.now() : null,
        pendingFirstDigit: null,
      },
    });
  },

  submitDigit: (digit: number) => {
    const state = get().problemState;
    if (!state || state.isComplete) return 'ignored';

    const currentStep = state.steps[state.currentStepIndex];
    if (!currentStep || currentStep.status !== 'active') return 'ignored';

    const isMedium = state.support === 'some';

    // Medium difficulty compound entry for addition (carry auto-populates)
    if (isMedium && currentStep.compoundValue !== undefined && currentStep.compoundValue >= 10) {
      const pending = state.pendingFirstDigit;

      if (pending === null) {
        // First keystroke — this should be the tens digit (carry)
        const expectedFirstDigit = Math.floor(currentStep.compoundValue / 10);

        if (digit !== expectedFirstDigit) {
          return 'incorrect';
        }

        // Store as pending, show tentatively
        set({
          problemState: {
            ...state,
            pendingFirstDigit: digit,
          },
        });
        return 'correct';
      } else {
        // Second keystroke — this should be the ones digit (answer)
        const fullValue = pending * 10 + digit;

        if (fullValue !== currentStep.compoundValue) {
          // Wrong second digit — clear pending and reject
          set({
            problemState: {
              ...state,
              pendingFirstDigit: null,
            },
          });
          return 'incorrect';
        }

        // Correct compound entry — complete answer step and auto-complete linked carry
        const newSteps = [...state.steps];
        newSteps[state.currentStepIndex] = {
          ...currentStep,
          enteredValue: currentStep.correctValue,
          status: 'completed',
        };

        const skipped = completeLinkedSteps(newSteps, currentStep.id, state.currentStepIndex);
        const effectiveNext = state.currentStepIndex + 1 + skipped;
        const newState = advanceToNext(
          { ...state, pendingFirstDigit: null },
          newSteps,
          effectiveNext - 1
        );

        set({ problemState: newState });
        return 'correct';
      }
    }

    // Medium difficulty: for subtraction, when the current step is answer_digit and
    // there's a borrow step right before it that is linked to this answer step,
    // auto-complete the borrow step when the answer is correct
    if (isMedium && currentStep.type === 'answer_digit') {
      const isCorrect = digit === currentStep.correctValue;
      if (!isCorrect) return 'incorrect';

      const newSteps = [...state.steps];
      newSteps[state.currentStepIndex] = {
        ...currentStep,
        enteredValue: digit,
        status: 'completed',
      };

      // Auto-complete any borrow steps linked to this answer step
      completeLinkedSteps(newSteps, currentStep.id, state.currentStepIndex);

      // Find next non-completed step
      let nextIdx = state.currentStepIndex + 1;
      while (nextIdx < newSteps.length && newSteps[nextIdx].status === 'completed') {
        nextIdx++;
      }

      const isComplete = nextIdx >= newSteps.length;
      if (!isComplete && newSteps[nextIdx]) {
        newSteps[nextIdx] = { ...newSteps[nextIdx], status: 'active' };
      }

      set({
        problemState: {
          ...state,
          steps: newSteps,
          currentStepIndex: isComplete ? state.currentStepIndex : nextIdx,
          isComplete,
          completedAt: isComplete ? Date.now() : null,
          pendingFirstDigit: null,
        },
      });
      return 'correct';
    }

    // Standard behavior (hard mode, or medium without compound)
    const isCorrect = digit === currentStep.correctValue;

    if (state.support === 'some' && !isCorrect) {
      return 'incorrect';
    }

    const newSteps = [...state.steps];
    newSteps[state.currentStepIndex] = {
      ...currentStep,
      enteredValue: digit,
      status: isCorrect ? 'completed' : 'active',
    };

    if (isCorrect) {
      const newState = advanceToNext(state, newSteps, state.currentStepIndex);
      set({ problemState: newState });
      return 'correct';
    }

    // Hard mode: wrong answer entered, will be shown then cleared
    set({
      problemState: {
        ...state,
        steps: newSteps,
        pendingFirstDigit: null,
      },
    });
    return 'incorrect';
  },

  nextStep: () => {
    // Used in easy mode to advance through pre-filled steps
    const state = get().problemState;
    if (!state || state.isComplete) return;

    const newSteps = [...state.steps];
    newSteps[state.currentStepIndex] = {
      ...newSteps[state.currentStepIndex],
      enteredValue: newSteps[state.currentStepIndex].correctValue,
      status: 'completed',
    };

    const newState = advanceToNext(state, newSteps, state.currentStepIndex);
    set({ problemState: newState });
  },

  reset: () => {
    set({ problemState: null });
  },
}));
