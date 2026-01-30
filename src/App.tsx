import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { OperationPicker } from './components/problem-setup/OperationPicker';
import { AdditionView } from './components/operations/AdditionView';
import { SubtractionView } from './components/operations/SubtractionView';
import { MultiplicationView } from './components/operations/MultiplicationView';
import { ShortDivisionView } from './components/operations/ShortDivisionView';
import { LongDivisionView } from './components/operations/LongDivisionView';
import { NumberPad } from './components/number-input/NumberPad';
import { Celebration } from './components/celebration/Celebration';
import { useUiStore } from './stores/uiStore';
import { useProblemStore } from './stores/problemStore';
import { useStepEngine } from './hooks/useStepEngine';
import { useScore } from './hooks/useScore';
import { useCelebration } from './hooks/useCelebration';
import { generateProblem } from './engines/problemGenerator';
import { generateAdditionSteps } from './engines/addition';
import { generateSubtractionSteps } from './engines/subtraction';
import { generateMultiplicationSteps } from './engines/multiplication';
import { generateShortDivisionSteps } from './engines/shortDivision';
import { generateLongDivisionSteps } from './engines/longDivision';
import type { Operation } from './engines/types';
import styles from './App.module.css';

function getStepsForProblem(operation: Operation, operands: number[]) {
  switch (operation) {
    case 'addition':
      return generateAdditionSteps(operands[0], operands[1]);
    case 'subtraction':
      return generateSubtractionSteps(operands[0], operands[1]);
    case 'multiplication':
      return generateMultiplicationSteps(operands[0], operands[1]);
    case 'shortDivision':
      return generateShortDivisionSteps(operands[0], operands[1]);
    case 'longDivision':
      return generateLongDivisionSteps(operands[0], operands[1]);
  }
}

function OperationView({ errorStepId }: { errorStepId?: string | null }) {
  const operation = useProblemStore(s => s.problemState?.problem.operation);

  switch (operation) {
    case 'addition':
      return <AdditionView errorStepId={errorStepId} />;
    case 'subtraction':
      return <SubtractionView errorStepId={errorStepId} />;
    case 'multiplication':
      return <MultiplicationView errorStepId={errorStepId} />;
    case 'shortDivision':
      return <ShortDivisionView errorStepId={errorStepId} />;
    case 'longDivision':
      return <LongDivisionView errorStepId={errorStepId} />;
    default:
      return null;
  }
}

function App() {
  const { screen, setScreen, setOperation, difficulty } = useUiStore();
  const { startProblem } = useProblemStore();
  const { problemState, handleDigit, handleNext, errorStepId, isEasyMode } = useStepEngine();
  const { score, recordCorrect } = useScore();
  const { celebrate } = useCelebration();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const theme = useUiStore.getState().theme;
    document.documentElement.dataset.theme = theme;
  }, []);

  const handleSelectOperation = useCallback((operation: Operation) => {
    setOperation(operation);
    setShowCelebration(false);

    const problem = generateProblem({ operation });
    const steps = getStepsForProblem(operation, problem.operands);

    startProblem(problem, steps, difficulty);
    setScreen('problem');
  }, [difficulty, setOperation, startProblem, setScreen]);

  const handleNextProblem = useCallback(() => {
    setShowCelebration(false);
    const operation = useUiStore.getState().operation;
    if (!operation) {
      setScreen('home');
      return;
    }
    handleSelectOperation(operation);
  }, [handleSelectOperation, setScreen]);

  useEffect(() => {
    if (problemState?.isComplete && !showCelebration) {
      const operation = useUiStore.getState().operation;
      if (operation) {
        recordCorrect(operation);
        celebrate(score.streakCurrent + 1);
      }
      setShowCelebration(true);
    }
  }, [problemState?.isComplete]);

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.content}>
        {screen === 'home' && (
          <OperationPicker onSelect={handleSelectOperation} />
        )}

        {screen === 'problem' && problemState && (
          <>
            <div className={styles.problemArea}>
              <OperationView errorStepId={errorStepId} />
            </div>
            <div className={styles.inputArea}>
              <NumberPad
                onDigit={handleDigit}
                onNext={handleNext}
                showNext={isEasyMode}
                disabled={problemState.isComplete}
              />
            </div>
          </>
        )}
      </div>

      {showCelebration && (
        <Celebration
          streak={score.streakCurrent}
          onNext={handleNextProblem}
        />
      )}
    </div>
  );
}

export default App;
