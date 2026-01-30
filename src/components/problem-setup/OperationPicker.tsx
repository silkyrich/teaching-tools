import type { Operation } from '../../engines/types';
import { DifficultySelector } from '../difficulty/DifficultySelector';
import { useUiStore } from '../../stores/uiStore';
import { useScore } from '../../hooks/useScore';
import styles from './OperationPicker.module.css';

interface OperationPickerProps {
  onSelect: (operation: Operation) => void;
}

const OPERATIONS: { operation: Operation; symbol: string; label: string }[] = [
  { operation: 'addition', symbol: '+', label: 'Addition' },
  { operation: 'subtraction', symbol: '−', label: 'Subtraction' },
  { operation: 'multiplication', symbol: '×', label: 'Multiplication' },
  { operation: 'shortDivision', symbol: '÷', label: 'Short Division' },
  { operation: 'longDivision', symbol: '÷', label: 'Long Division' },
];

export function OperationPicker({ onSelect }: OperationPickerProps) {
  const { difficulty, setDifficulty } = useUiStore();
  const { score } = useScore();

  return (
    <div className={styles.container}>
      <div className={styles.title}>Maths Steps</div>
      <div className={styles.subtitle}>Choose an operation</div>

      <div className={styles.grid}>
        {OPERATIONS.map(op => (
          <button
            key={op.operation}
            className={styles.opButton}
            onClick={() => onSelect(op.operation)}
            type="button"
          >
            <span className={styles.opSymbol}>{op.symbol}</span>
            <span className={styles.opLabel}>{op.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.settingsSection}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </div>

      <div className={styles.scoreDisplay}>
        <span>Score: <span className={styles.scoreValue}>{score.totalCorrect}</span></span>
        <span>Streak: <span className={styles.scoreValue}>{score.streakCurrent}</span></span>
      </div>
    </div>
  );
}
