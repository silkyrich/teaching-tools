import styles from './RocketProgress.module.css';

interface RocketProgressProps {
  current: number;
  total: number;
}

function RocketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path
        d="M12 2C12 2 8 6 8 14l4 4 4-4c0-8-4-12-4-12z"
        fill="var(--color-primary)"
        stroke="var(--color-accent)"
        strokeWidth="1"
      />
      {/* Window */}
      <circle cx="12" cy="10" r="2" fill="var(--color-accent)" opacity="0.7" />
      {/* Left fin */}
      <path d="M8 14l-3 3 1 1 4-2z" fill="var(--color-primary)" opacity="0.8" />
      {/* Right fin */}
      <path d="M16 14l3 3-1 1-4-2z" fill="var(--color-primary)" opacity="0.8" />
      {/* Flame */}
      <path
        d="M10 18l2 4 2-4"
        fill="var(--color-accent)"
        opacity="0.9"
        className={styles.flame}
      />
    </svg>
  );
}

function PlanetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Planet body */}
      <circle cx="12" cy="12" r="8" fill="var(--color-surface-raised)" stroke="var(--color-primary)" strokeWidth="1.5" />
      {/* Ring */}
      <ellipse cx="12" cy="12" rx="12" ry="4" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" opacity="0.6" />
      {/* Surface detail */}
      <circle cx="10" cy="10" r="2" fill="var(--color-primary)" opacity="0.25" />
      <circle cx="14" cy="13" r="1.5" fill="var(--color-primary)" opacity="0.2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l2.9 5.9L21 9l-4.5 4.4L17.8 20 12 16.9 6.2 20l1.3-6.6L3 9l6.1-1.1z"
        fill="var(--color-accent)"
        stroke="var(--color-primary)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function RocketProgress({ current, total }: RocketProgressProps) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;
  const isComplete = current >= total;

  return (
    <div className={styles.container}>
      <div className={styles.track}>
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
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      <div
        className={`${styles.rocket} ${isComplete ? styles.rocketLanded : ''}`}
        style={{ left: `${progress * 100}%` }}
      >
        <RocketIcon />
      </div>
      <div className={styles.planet}>
        {isComplete ? <StarIcon /> : <PlanetIcon />}
      </div>
    </div>
  );
}
