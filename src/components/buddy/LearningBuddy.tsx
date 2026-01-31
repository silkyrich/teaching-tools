import { useEffect, useState } from 'react';
import styles from './LearningBuddy.module.css';

export type BuddyMood = 'idle' | 'thinking' | 'happy' | 'celebrate' | 'error';

interface LearningBuddyProps {
  mood: BuddyMood;
  onTap?: () => void;
  speechBubble?: React.ReactNode;
}

const FACES: Record<BuddyMood, { eyes: string; mouth: string }> = {
  idle:      { eyes: '\u25C9  \u25C9', mouth: '\u203F' },
  thinking:  { eyes: '\u25C9  \u25C9', mouth: '\u2022\u2022\u2022' },
  happy:     { eyes: '\u25E0  \u25E0', mouth: '\u25E1' },
  celebrate: { eyes: '\u2605  \u2605', mouth: '\u25BD' },
  error:     { eyes: '\u25C9  \u25C9', mouth: '\u25B3' },
};

export function LearningBuddy({ mood, onTap, speechBubble }: LearningBuddyProps) {
  const [animClass, setAnimClass] = useState('');
  const face = FACES[mood];

  useEffect(() => {
    if (mood === 'celebrate') {
      setAnimClass(styles.bounce);
    } else if (mood === 'error') {
      setAnimClass(styles.shake);
    } else if (mood === 'happy') {
      setAnimClass(styles.wiggle);
    } else {
      setAnimClass('');
    }
  }, [mood]);

  const isClickable = !!onTap;

  return (
    <div className={styles.buddyContainer}>
      {speechBubble && (
        <div className={styles.speechBubble}>
          {speechBubble}
        </div>
      )}
      <div
        className={`${styles.buddy} ${animClass} ${isClickable ? styles.clickable : ''}`}
        onClick={onTap}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? 'Ask for a hint' : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onTap?.(); } : undefined}
      >
        <div className={styles.helmet}>
          <div className={styles.visor}>
            <div className={styles.eyes}>{face.eyes}</div>
            <div className={styles.mouth}>{face.mouth}</div>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.arm + ' ' + styles.armLeft} />
          <div className={styles.torso} />
          <div className={styles.arm + ' ' + styles.armRight} />
        </div>
        {isClickable && !speechBubble && (
          <div className={styles.tapHint}>tap me!</div>
        )}
      </div>
    </div>
  );
}
