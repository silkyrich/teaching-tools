import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { Operation, ScoreData } from '../engines/types';

const COOKIE_KEY = 'maths-steps-score';

function defaultScore(): ScoreData {
  return {
    totalCorrect: 0,
    totalAttempted: 0,
    streakCurrent: 0,
    streakBest: 0,
    byOperation: {
      addition: { correct: 0, attempted: 0 },
      subtraction: { correct: 0, attempted: 0 },
      multiplication: { correct: 0, attempted: 0 },
      shortDivision: { correct: 0, attempted: 0 },
      longDivision: { correct: 0, attempted: 0 },
    },
  };
}

function loadScore(): ScoreData {
  try {
    const raw = Cookies.get(COOKIE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultScore(), ...parsed };
    }
  } catch {}
  return defaultScore();
}

function saveScore(score: ScoreData) {
  Cookies.set(COOKIE_KEY, JSON.stringify(score), { expires: 365 });
}

interface ScoreStore {
  score: ScoreData;
  recordCorrect: (operation: Operation) => void;
}

export const useScore = create<ScoreStore>((set) => ({
  score: loadScore(),

  recordCorrect: (operation: Operation) => {
    set((state) => {
      const prev = state.score;
      const newStreak = prev.streakCurrent + 1;
      const updated: ScoreData = {
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempted: prev.totalAttempted + 1,
        streakCurrent: newStreak,
        streakBest: Math.max(prev.streakBest, newStreak),
        byOperation: {
          ...prev.byOperation,
          [operation]: {
            correct: prev.byOperation[operation].correct + 1,
            attempted: prev.byOperation[operation].attempted + 1,
          },
        },
      };
      saveScore(updated);
      return { score: updated };
    });
  },
}));
