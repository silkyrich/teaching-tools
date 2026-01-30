import type { Operation, NumberSize, Support, InputMode } from '../../engines/types';
import { SegmentedSelector } from '../settings/SegmentedSelector';
import { useUiStore } from '../../stores/uiStore';
import { useScore } from '../../hooks/useScore';
import styles from './OperationPicker.module.css';

interface OperationPickerProps {
  onSelect: (operation: Operation) => void;
}

const OPERATIONS: { operation: Operation; symbol: string; label: string }[] = [
  { operation: 'addition', symbol: '+', label: 'Addition' },
  { operation: 'subtraction', symbol: '\u2212', label: 'Subtraction' },
  { operation: 'multiplication', symbol: '\u00D7', label: 'Multiplication' },
  { operation: 'shortDivision', symbol: '\u00F7', label: 'Short Division' },
  { operation: 'longDivision', symbol: '\u00F7', label: 'Long Division' },
];

const NUMBER_SIZE_OPTIONS: { value: NumberSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const SUPPORT_OPTIONS: { value: Support; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'some', label: 'Some' },
  { value: 'none', label: 'None' },
];

const INPUT_MODE_OPTIONS: { value: InputMode; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'custom', label: 'Custom' },
];

export function OperationPicker({ onSelect }: OperationPickerProps) {
  const { numberSize, setNumberSize, support, setSupport, inputMode, setInputMode } = useUiStore();
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
        <SegmentedSelector
          label="Numbers"
          options={NUMBER_SIZE_OPTIONS}
          value={numberSize}
          onChange={setNumberSize}
        />
        <SegmentedSelector
          label="Support"
          options={SUPPORT_OPTIONS}
          value={support}
          onChange={setSupport}
        />
        <SegmentedSelector
          label="Input"
          options={INPUT_MODE_OPTIONS}
          value={inputMode}
          onChange={setInputMode}
        />
      </div>

      <div className={styles.scoreDisplay}>
        <span>Score: <span className={styles.scoreValue}>{score.totalCorrect}</span></span>
        <span>Streak: <span className={styles.scoreValue}>{score.streakCurrent}</span></span>
      </div>
    </div>
  );
}
