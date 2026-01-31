import type { Operation, OperationConfig } from './types';
import {
  getAdditionOperationLayout,
  getAdditionGridCells,
  getAdditionStepExplanation,
} from './addition';
import {
  getSubtractionOperationLayout,
  getSubtractionGridCells,
  getSubtractionStepExplanation,
} from './subtraction';
import {
  getMultiplicationOperationLayout,
  getMultiplicationGridCells,
  getMultiplicationStepExplanation,
} from './multiplication';
import {
  getShortDivisionOperationLayout,
  getShortDivisionGridCells,
  getShortDivisionStepExplanation,
} from './shortDivision';
import {
  getLongDivisionOperationLayout,
  getLongDivisionGridCells,
  getLongDivisionStepExplanation,
} from './longDivision';

function wrapSubCells(
  fn: (a: number, b: number, steps: any[], showHints: boolean) => any[]
) {
  return (operands: number[], steps: any[], showHints: boolean, _pending: number | null) =>
    fn(operands[0], operands[1], steps, showHints);
}

function wrapDivCells(
  fn: (divisor: number, dividend: number, steps: any[], showHints: boolean) => any[]
) {
  return (operands: number[], steps: any[], showHints: boolean, _pending: number | null) =>
    fn(operands[0], operands[1], steps, showHints);
}

export const operationRegistry: Record<Operation, OperationConfig> = {
  addition: {
    getLayout: getAdditionOperationLayout,
    getCells: (operands, steps, showHints, pendingFirstDigit) =>
      getAdditionGridCells(operands, steps, showHints, pendingFirstDigit),
    getStepExplanation: getAdditionStepExplanation,
  },
  subtraction: {
    getLayout: getSubtractionOperationLayout,
    getCells: wrapSubCells(getSubtractionGridCells),
    getStepExplanation: getSubtractionStepExplanation,
  },
  multiplication: {
    getLayout: getMultiplicationOperationLayout,
    getCells: wrapSubCells(getMultiplicationGridCells),
    getStepExplanation: getMultiplicationStepExplanation,
  },
  shortDivision: {
    getLayout: getShortDivisionOperationLayout,
    getCells: wrapDivCells(getShortDivisionGridCells),
    getStepExplanation: getShortDivisionStepExplanation,
  },
  longDivision: {
    getLayout: getLongDivisionOperationLayout,
    getCells: wrapDivCells(getLongDivisionGridCells),
    getStepExplanation: getLongDivisionStepExplanation,
  },
};
