import { create } from 'zustand';
import type { Difficulty, Operation } from '../engines/types';

export type Theme = 'forest' | 'ocean' | 'space' | 'candy' | 'volcano' | 'arctic';

export const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: 'forest', label: 'Forest', icon: '\u{1F332}' },
  { id: 'ocean', label: 'Ocean', icon: '\u{1F30A}' },
  { id: 'space', label: 'Space', icon: '\u{1F680}' },
  { id: 'candy', label: 'Candy', icon: '\u{1F36C}' },
  { id: 'volcano', label: 'Volcano', icon: '\u{1F30B}' },
  { id: 'arctic', label: 'Arctic', icon: '\u{2744}\u{FE0F}' },
];

const THEME_IDS = new Set<string>(THEMES.map(t => t.id));

type Screen = 'home' | 'problem' | 'setup';

interface UiStore {
  screen: Screen;
  theme: Theme;
  difficulty: Difficulty;
  operation: Operation | null;
  setScreen: (screen: Screen) => void;
  setTheme: (theme: Theme) => void;
  nextTheme: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setOperation: (operation: Operation) => void;
}

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem('maths-steps-theme');
    if (saved && THEME_IDS.has(saved)) return saved as Theme;
  } catch {}
  return 'forest';
}

function loadDifficulty(): Difficulty {
  try {
    const saved = localStorage.getItem('maths-steps-difficulty');
    if (saved === 'easy' || saved === 'medium' || saved === 'hard') return saved;
  } catch {}
  return 'medium';
}

export const useUiStore = create<UiStore>((set, get) => ({
  screen: 'home',
  theme: loadTheme(),
  difficulty: loadDifficulty(),
  operation: null,

  setScreen: (screen) => set({ screen }),
  setTheme: (theme) => {
    localStorage.setItem('maths-steps-theme', theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  nextTheme: () => {
    const current = get().theme;
    const idx = THEMES.findIndex(t => t.id === current);
    const next = THEMES[(idx + 1) % THEMES.length];
    get().setTheme(next.id);
  },
  setDifficulty: (difficulty) => {
    localStorage.setItem('maths-steps-difficulty', difficulty);
    set({ difficulty });
  },
  setOperation: (operation) => set({ operation }),
}));
