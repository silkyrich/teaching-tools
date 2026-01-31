import styles from './RocketProgress.module.css';

interface RocketProgressProps {
  current: number;
  total: number;
}

export function RocketProgress({ current, total }: RocketProgressProps) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;
  const isComplete = current >= total;

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        {/* Star dots along the path */}
        {Array.from({ length: Math.min(total, 12) }, (_, i) => {
          const pos = ((i + 1) / total) * 100;
          const done = (i + 1) <= current;
          return (
            <div
              key={i}
              className={`${styles.dot} ${done ? styles.dotDone : ''}`}
              style={{ left: `${pos}%` }}
            />
          );
        })}
        {/* Filled bar */}
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      {/* Rocket */}
      <div
        className={`${styles.rocket} ${isComplete ? styles.rocketLanded : ''}`}
        style={{ left: `${progress * 100}%` }}
      >
        🚀
      </div>
      {/* Planet at end */}
      <div className={styles.planet}>
        {isComplete ? '🌟' : '🪐'}
      </div>
    </div>
  );
}
