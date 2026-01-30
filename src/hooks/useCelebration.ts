import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useCelebration() {
  const lastStreakMilestone = useRef(0);

  const celebrate = useCallback((streak: number) => {
    // Basic celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4caf50', '#ffcc02', '#2196f3', '#ff9800', '#e91e63'],
    });

    // Streak milestone celebrations
    const milestones = [5, 10, 25, 50, 100];
    const milestone = milestones.find(m => streak >= m && m > lastStreakMilestone.current);

    if (milestone) {
      lastStreakMilestone.current = milestone;
      // Extra fireworks for milestones
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff'],
        });
      }, 300);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 600);
    }
  }, []);

  const resetMilestone = useCallback(() => {
    lastStreakMilestone.current = 0;
  }, []);

  return { celebrate, resetMilestone };
}
