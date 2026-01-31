import { useEffect, useState } from 'react';
import styles from './LearningBuddy.module.css';

export type BuddyMood = 'idle' | 'thinking' | 'happy' | 'celebrate' | 'error';

interface LearningBuddyProps {
  mood: BuddyMood;
}

const FACES: Record<BuddyMood, { eyes: string; mouth: string }> = {
  idle:      { eyes: '◉  ◉', mouth: '‿' },
  thinking:  { eyes: '◉  ◉', mouth: '•••' },
  happy:     { eyes: '◠  ◠', mouth: '◡' },
  celebrate: { eyes: '★  ★', mouth: '▽' },
  error:     { eyes: '◉  ◉', mouth: '△' },
};

export function LearningBuddy({ mood }: LearningBuddyProps) {
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

  return (
    <div className={`${styles.buddy} ${animClass}`} aria-hidden="true">
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
    </div>
  );
}
