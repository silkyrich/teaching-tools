import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { OperationPicker } from './components/problem-setup/OperationPicker';
import { CustomNumberEntry } from './components/problem-setup/CustomNumberEntry';
import { OperationView } from './components/operations/OperationView';
import { NumberPad } from './components/number-input/NumberPad';
import { TrainingPanel } from './components/training/TrainingPanel';
import { Celebration } from './components/celebration/Celebration';
import { useUiStore } from './stores/uiStore';
import { useProblemStore } from './stores/problemStore';
import { useStepEngine } from './hooks/useStepEngine';
import { useScore } from './hooks/useScore';
import { useCelebration } from './hooks/useCelebration';
import { generateProblem, createProblemFromOperands } from './engines/problemGenerator';
import { generateAdditionSteps } from './engines/addition';
import { generateSubtractionSteps } from './engines/subtraction';
import { generateMultiplicationSteps } from './engines/multiplication';
import { generateShortDivisionSteps } from './engines/shortDivision';
import { generateLongDivisionSteps } from './engines/longDivision';
import { parseUrlState, updateUrlState, clearUrlState } from './utils/urlState';
import type { Operation } from './engines/types';
import styles from './App.module.css';

function getStepsForProblem(operation: Operation, operands: number[]) {
  switch (operation) {
    case 'addition':
      return generateAdditionSteps(operands);
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

function App() {
  const { screen, setScreen, setOperation, numberSize, support, inputMode,
          setNumberSize, setSupport, trainingMode } = useUiStore();
  const { startProblem, startProblemAtStep } = useProblemStore();
  const { problemState, handleDigit, handleNext, errorStepId, isViewOnly } = useStepEngine();
  const { score, recordCorrect } = useScore();
  const { celebrate } = useCelebration();
  const [showCelebration, setShowCelebration] = useState(false);
  const urlInitDone = useRef(false);

  // Apply theme on mount
  useEffect(() => {
    const theme = useUiStore.getState().theme;
    document.documentElement.dataset.theme = theme;
  }, []);

  // Read URL state on mount
  useEffect(() => {
    if (urlInitDone.current) return;
    urlInitDone.current = true;

    const urlState = parseUrlState();
    if (!urlState) return;

    const { operation, operands, numberSize: urlNs, support: urlSup, step } = urlState;

    if (urlNs) setNumberSize(urlNs);
    if (urlSup) setSupport(urlSup);

    const currentSupport = urlSup ?? useUiStore.getState().support;
    setOperation(operation);

    const problem = createProblemFromOperands(operation, operands);
    const steps = getStepsForProblem(operation, problem.operands);

    if (step && step > 0) {
      startProblemAtStep(problem, steps, currentSupport, step);
    } else {
      startProblem(problem, steps, currentSupport);
    }
    setScreen('problem');
  }, [setNumberSize, setSupport, setOperation, startProblem, startProblemAtStep, setScreen]);

  // Update URL whenever problem state changes
  useEffect(() => {
    if (!urlInitDone.current) return;

    if (screen === 'home' || screen === 'customEntry') {
      clearUrlState();
      return;
    }

    if (screen === 'problem' && problemState) {
      const operation = problemState.problem.operation;
      const operands = problemState.problem.operands;
      const currentSupport = problemState.support;
      const currentNs = useUiStore.getState().numberSize;
      const stepIndex = problemState.currentStepIndex;
      updateUrlState(operation, operands, currentNs, currentSupport, stepIndex);
    }
  }, [screen, problemState?.currentStepIndex, problemState?.isComplete]);

  const startWithOperands = useCallback((operation: Operation, operands: number[]) => {
    setShowCelebration(false);
    const problem = createProblemFromOperands(operation, operands);
    const steps = getStepsForProblem(operation, problem.operands);
    startProblem(problem, steps, support);
    setScreen('problem');
  }, [support, startProblem, setScreen]);

  const handleSelectOperation = useCallback((operation: Operation) => {
    setOperation(operation);
    setShowCelebration(false);

    if (inputMode === 'custom') {
      setScreen('customEntry');
      return;
    }

    const problem = generateProblem({ operation, numberSize });
    const steps = getStepsForProblem(operation, problem.operands);

    startProblem(problem, steps, support);
    setScreen('problem');
  }, [numberSize, support, inputMode, setOperation, startProblem, setScreen]);

  const handleNextProblem = useCallback(() => {
    setShowCelebration(false);
    const operation = useUiStore.getState().operation;
    if (!operation) {
      setScreen('home');
      return;
    }

    if (inputMode === 'custom') {
      setScreen('customEntry');
      return;
    }

    handleSelectOperation(operation);
  }, [inputMode, handleSelectOperation, setScreen]);

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

  const currentOperation = useUiStore(s => s.operation);

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.content}>
        {screen === 'home' && (
          <OperationPicker onSelect={handleSelectOperation} />
        )}

        {screen === 'customEntry' && currentOperation && (
          <CustomNumberEntry
            operation={currentOperation}
            onStart={(operands) => startWithOperands(currentOperation, operands)}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'problem' && problemState && (
          <div className={styles.problemLayout}>
            <div className={styles.problemMain}>
              <div className={styles.problemArea}>
                <OperationView errorStepId={errorStepId} />
              </div>
              {trainingMode && (
                <div className={styles.trainingPanel}>
                  <TrainingPanel />
                </div>
              )}
            </div>
            <div className={styles.inputArea}>
              <NumberPad
                onDigit={handleDigit}
                onNext={handleNext}
                showNext={isViewOnly}
                disabled={problemState.isComplete}
              />
            </div>
          </div>
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
