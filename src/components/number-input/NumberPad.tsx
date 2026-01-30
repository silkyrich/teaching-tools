import { useCallback } from 'react';
import styles from './NumberPad.module.css';

interface NumberPadProps {
  onDigit: (digit: number) => void;
  onNext?: () => void;
  showNext?: boolean;
  disabled?: boolean;
}

export function NumberPad({ onDigit, onNext, showNext, disabled }: NumberPadProps) {
  const handleDigit = useCallback((digit: number) => {
    if (disabled) return;
    onDigit(digit);
  }, [onDigit, disabled]);

  const digitButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {digitButtons.map(d => (
          <button
            key={d}
            className={`${styles.button} ${disabled ? styles.disabled : ''}`}
            onClick={() => handleDigit(d)}
            type="button"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          className={`${styles.button} ${disabled ? styles.disabled : ''}`}
          onClick={() => handleDigit(0)}
          type="button"
        >
          0
        </button>
        <div />
        {showNext && (
          <button
            className={`${styles.button} ${styles.nextButton} ${disabled ? styles.disabled : ''}`}
            onClick={onNext}
            type="button"
          >
            Next Step →
          </button>
        )}
      </div>
    </div>
  );
}
