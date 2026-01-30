export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'shortDivision' | 'longDivision';

export type Difficulty = 'easy' | 'medium' | 'hard';

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
}

export interface ProblemState {
  problem: Problem;
  difficulty: Difficulty;
  steps: StepInput[];
  currentStepIndex: number;
  isComplete: boolean;
  startedAt: number;
  completedAt: number | null;
}

export interface GridCell {
  row: number;
  col: number;
  layer: 'main' | 'carry' | 'borrow' | 'working';
  content: string;
  editable: boolean;
  status: 'fixed' | 'pending' | 'active' | 'completed' | 'hidden';
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
