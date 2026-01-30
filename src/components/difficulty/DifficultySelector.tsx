import type { Difficulty } from '../../engines/types';
import styles from './DifficultySelector.module.css';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className={styles.container}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`${styles.button} ${value === opt.value ? styles.active : ''}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
