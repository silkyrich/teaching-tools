import { useStepExplanation } from '../operations/OperationView';
import { useProblemStore } from '../../stores/problemStore';
import styles from './TrainingPanel.module.css';

export function TrainingPanel() {
  const explanation = useStepExplanation();
  const isComplete = useProblemStore(s => s.problemState?.isComplete ?? false);

  if (!explanation) return null;

  return (
    <div className={`${styles.panel} ${isComplete ? styles.complete : ''}`}>
      <div className={styles.header}>
        {isComplete ? 'Finished!' : 'How to solve this step'}
      </div>
      <div className={styles.title}>{explanation.title}</div>
      <div className={styles.detail}>{explanation.detail}</div>
    </div>
  );
}
