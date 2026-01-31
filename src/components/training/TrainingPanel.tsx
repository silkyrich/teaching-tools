import { useState, useEffect } from 'react';
import { useStepExplanation } from '../operations/OperationView';
import { useProblemStore } from '../../stores/problemStore';
import styles from './TrainingPanel.module.css';

interface TrainingPanelProps {
  /** Current hint level: 0=hidden, 1=title, 2=title+detail */
  hintLevel: number;
  /** Callback to request next hint level */
  onRequestHint: () => void;
}

export function TrainingPanel({ hintLevel, onRequestHint }: TrainingPanelProps) {
  const explanation = useStepExplanation();
  const isComplete = useProblemStore(s => s.problemState?.isComplete ?? false);

  if (!explanation) return null;

  // When complete, always show everything
  if (isComplete) {
    return (
      <div className={styles.panel}>
        <div className={styles.title}>{explanation.title}</div>
        <div className={styles.detail}>{explanation.detail}</div>
      </div>
    );
  }

  // Level 0 — nothing shown (buddy shows "tap me")
  if (hintLevel === 0) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.title}>{explanation.title}</div>
      {hintLevel === 1 && (
        <button className={styles.moreButton} onClick={onRequestHint}>
          Tell me more...
        </button>
      )}
      {hintLevel >= 2 && (
        <div className={styles.detail}>{explanation.detail}</div>
      )}
    </div>
  );
}

/** Hook to manage progressive hint state, resets on step change */
export function useHintState() {
  const currentStepIndex = useProblemStore(s => s.problemState?.currentStepIndex ?? 0);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    setHintLevel(0);
  }, [currentStepIndex]);

  const requestHint = () => {
    setHintLevel(prev => Math.min(prev + 1, 2));
  };

  return { hintLevel, requestHint };
}
