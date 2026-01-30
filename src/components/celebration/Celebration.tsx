import styles from './Celebration.module.css';

interface CelebrationProps {
  streak: number;
  onNext: () => void;
}

const MILESTONES = [5, 10, 25, 50, 100];

export function Celebration({ streak, onNext }: CelebrationProps) {
  const isMilestone = MILESTONES.includes(streak);

  return (
    <div className={styles.overlay}>
      <div className={styles.title}>Well Done!</div>
      <div className={`${styles.streak} ${isMilestone ? styles.streakMilestone : ''}`}>
        {isMilestone
          ? `🔥 ${streak} in a row! Amazing!`
          : `${streak} correct`
        }
      </div>
      <button className={styles.nextButton} onClick={onNext} type="button">
        Next Problem →
      </button>
    </div>
  );
}
