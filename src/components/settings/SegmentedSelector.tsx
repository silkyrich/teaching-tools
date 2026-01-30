import styles from './SegmentedSelector.module.css';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedSelectorProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedSelectorProps<T>) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div className={styles.container}>
        {options.map(opt => (
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
    </div>
  );
}
