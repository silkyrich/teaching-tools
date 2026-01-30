import { create } from 'zustand';
import type { Difficulty, Operation } from '../engines/types';

type Screen = 'home' | 'problem' | 'setup';

interface UiStore {
  screen: Screen;
  theme: 'forest' | 'ocean';
  difficulty: Difficulty;
  operation: Operation | null;
  setScreen: (screen: Screen) => void;
  setTheme: (theme: 'forest' | 'ocean') => void;
  toggleTheme: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setOperation: (operation: Operation) => void;
}

function loadTheme(): 'forest' | 'ocean' {
  try {
    const saved = localStorage.getItem('maths-steps-theme');
    if (saved === 'forest' || saved === 'ocean') return saved;
  } catch {}
  return 'forest';
}

export const useUiStore = create<UiStore>((set, get) => ({
  screen: 'home',
  theme: loadTheme(),
  difficulty: 'medium',
  operation: null,

  setScreen: (screen) => set({ screen }),
  setTheme: (theme) => {
    localStorage.setItem('maths-steps-theme', theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'forest' ? 'ocean' : 'forest';
    get().setTheme(newTheme);
  },
  setDifficulty: (difficulty) => set({ difficulty }),
  setOperation: (operation) => set({ operation }),
}));
