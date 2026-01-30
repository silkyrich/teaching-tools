import { useState } from 'react';
import type { Operation } from '../../engines/types';
import styles from './CustomNumberEntry.module.css';

interface CustomNumberEntryProps {
  operation: Operation;
  onStart: (operands: number[]) => void;
  onBack: () => void;
}

const LABELS: Record<Operation, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  shortDivision: 'Short Division',
  longDivision: 'Long Division',
};

function isAddition(op: Operation) {
  return op === 'addition';
}

function isDivision(op: Operation) {
  return op === 'shortDivision' || op === 'longDivision';
}

export function CustomNumberEntry({ operation, onStart, onBack }: CustomNumberEntryProps) {
  const fieldCount = isAddition(operation) ? 2 : 2;
  const [values, setValues] = useState<string[]>(Array(fieldCount).fill(''));
  const [error, setError] = useState('');

  const canAddMore = isAddition(operation) && values.length < 5;

  function updateValue(index: number, val: string) {
    const next = [...values];
    next[index] = val;
    setValues(next);
    setError('');
  }

  function addField() {
    if (canAddMore) {
      setValues([...values, '']);
    }
  }

  function removeField(index: number) {
    if (values.length > 2) {
      setValues(values.filter((_, i) => i !== index));
    }
  }

  function validate(): number[] | null {
    const nums = values.map(v => parseInt(v, 10));
    if (nums.some(isNaN) || nums.some(n => n < 1)) {
      setError('Enter positive whole numbers');
      return null;
    }

    if (operation === 'subtraction' && nums[0] < nums[1]) {
      setError('First number must be larger');
      return null;
    }

    if (isDivision(operation) && nums[0] < 2) {
      setError('Divisor must be at least 2');
      return null;
    }

    return nums;
  }

  function handleGo() {
    const nums = validate();
    if (nums) onStart(nums);
  }

  function getFieldLabel(index: number): string {
    if (isDivision(operation)) {
      return index === 0 ? 'Divisor' : 'Dividend';
    }
    return `#${index + 1}`;
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>{LABELS[operation]}</div>

      <div className={styles.fields}>
        {values.map((val, i) => (
          <div key={i} className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{getFieldLabel(i)}</span>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={val}
              onChange={e => updateValue(i, e.target.value.replace(/\D/g, ''))}
              autoFocus={i === 0}
            />
            {isAddition(operation) && values.length > 2 && (
              <button
                className={styles.removeButton}
                onClick={() => removeField(i)}
                type="button"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {canAddMore && (
        <button className={styles.addButton} onClick={addField} type="button">
          + Add number
        </button>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={onBack} type="button">
          Back
        </button>
        <button className={styles.goButton} onClick={handleGo} type="button">
          Go
        </button>
      </div>
    </div>
  );
}
