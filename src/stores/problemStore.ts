import { create } from 'zustand';
import type { Problem, ProblemState, StepInput, Difficulty } from '../engines/types';

interface ProblemStore {
  problemState: ProblemState | null;
  startProblem: (problem: Problem, steps: StepInput[], difficulty: Difficulty) => void;
  submitDigit: (digit: number) => 'correct' | 'incorrect' | 'ignored';
  nextStep: () => void;
  reset: () => void;
}

export const useProblemStore = create<ProblemStore>((set, get) => ({
  problemState: null,

  startProblem: (problem, steps, difficulty) => {
    const initialSteps = steps.map((s, i) => ({
      ...s,
      status: (i === 0 ? 'active' : 'pending') as StepInput['status'],
      enteredValue: null,
    }));

    set({
      problemState: {
        problem,
        difficulty,
        steps: initialSteps,
        currentStepIndex: 0,
        isComplete: false,
        startedAt: Date.now(),
        completedAt: null,
      },
    });
  },

  submitDigit: (digit: number) => {
    const state = get().problemState;
    if (!state || state.isComplete) return 'ignored';

    const currentStep = state.steps[state.currentStepIndex];
    if (!currentStep || currentStep.status !== 'active') return 'ignored';

    const isCorrect = digit === currentStep.correctValue;

    if (state.difficulty === 'medium' && !isCorrect) {
      return 'incorrect';
    }

    // For easy mode, the digit is always correct (pre-filled)
    // For hard mode, we accept any digit but only advance on correct

    const newSteps = [...state.steps];
    newSteps[state.currentStepIndex] = {
      ...currentStep,
      enteredValue: digit,
      status: isCorrect ? 'completed' : 'active',
    };

    if (isCorrect) {
      const nextIndex = state.currentStepIndex + 1;
      const isComplete = nextIndex >= state.steps.length;

      if (!isComplete && newSteps[nextIndex]) {
        newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'active' };
      }

      set({
        problemState: {
          ...state,
          steps: newSteps,
          currentStepIndex: isComplete ? state.currentStepIndex : nextIndex,
          isComplete,
          completedAt: isComplete ? Date.now() : null,
        },
      });
      return 'correct';
    }

    // Hard mode: wrong answer entered, will be shown then cleared
    set({
      problemState: {
        ...state,
        steps: newSteps,
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

    const nextIndex = state.currentStepIndex + 1;
    const isComplete = nextIndex >= state.steps.length;

    if (!isComplete && newSteps[nextIndex]) {
      newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'active' };
    }

    set({
      problemState: {
        ...state,
        steps: newSteps,
        currentStepIndex: isComplete ? state.currentStepIndex : nextIndex,
        isComplete,
        completedAt: isComplete ? Date.now() : null,
      },
    });
  },

  reset: () => {
    set({ problemState: null });
  },
}));
