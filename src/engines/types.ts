export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'shortDivision' | 'longDivision';

export type NumberSize = 'small' | 'medium' | 'large';
export type Support = 'full' | 'some' | 'none';
export type InputMode = 'random' | 'custom';

// Legacy type kept for URL backwards compat
export type Difficulty = 'easy' | 'medium' | 'hard';

export function difficultyToSettings(d: Difficulty): { numberSize: NumberSize; support: Support } {
  switch (d) {
    case 'easy':   return { numberSize: 'small',  support: 'full' };
    case 'medium': return { numberSize: 'medium', support: 'some' };
    case 'hard':   return { numberSize: 'large',  support: 'none' };
  }
}

export interface Problem {
  id: string;
  operation: Operation;
  operands: number[];
  answer: number;
  remainder?: number;
}

export type StepType =
  | 'answer_digit'
  | 'carry'
  | 'borrow'
  | 'remainder'
  | 'bring_down'
  | 'partial_product'
  | 'partial_carry';

export interface GridPosition {
  row: number;
  col: number;
  layer: 'main' | 'carry' | 'borrow' | 'working';
}

export interface StepInput {
  id: string;
  type: StepType;
  position: GridPosition;
  correctValue: number;
  enteredValue: number | null;
  status: 'pending' | 'active' | 'completed';
  label?: string;
  linkedStepId?: string;
  compoundValue?: number;
}

export interface ProblemState {
  problem: Problem;
  support: Support;
  steps: StepInput[];
  currentStepIndex: number;
  isComplete: boolean;
  startedAt: number;
  completedAt: number | null;
  pendingFirstDigit: number | null;
}

export interface GridCell {
  row: number;
  col: number;
  layer: 'main' | 'carry' | 'borrow' | 'working';
  content: string;
  editable: boolean;
  status: 'fixed' | 'pending' | 'active' | 'completed' | 'hidden' | 'tentative';
  type?: StepType;
  stepId?: string;
}

export interface ScoreData {
  totalCorrect: number;
  totalAttempted: number;
  streakCurrent: number;
  streakBest: number;
  byOperation: Record<Operation, { correct: number; attempted: number }>;
}

export interface StepExplanation {
  title: string;
  detail: string;
}

export interface OperationLayout {
  rows: number;
  cols: number;
  lineAfterRow?: number;
}

export interface OperationConfig {
  getLayout: (operands: number[]) => OperationLayout;
  getCells: (
    operands: number[],
    steps: StepInput[],
    showHints: boolean,
    pendingFirstDigit: number | null
  ) => GridCell[];
  getStepExplanation: (
    operands: number[],
    steps: StepInput[],
    currentStepIndex: number
  ) => StepExplanation;
}
