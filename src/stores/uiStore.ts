import { create } from 'zustand';
import { difficultyToSettings } from '../engines/types';
import type { NumberSize, Support, InputMode, Operation } from '../engines/types';

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

type Screen = 'home' | 'problem' | 'setup' | 'customEntry';

interface UiStore {
  screen: Screen;
  theme: Theme;
  numberSize: NumberSize;
  support: Support;
  inputMode: InputMode;
  operation: Operation | null;
  setScreen: (screen: Screen) => void;
  setTheme: (theme: Theme) => void;
  nextTheme: () => void;
  setNumberSize: (ns: NumberSize) => void;
  setSupport: (s: Support) => void;
  setInputMode: (m: InputMode) => void;
  setOperation: (operation: Operation) => void;
}

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem('maths-steps-theme');
    if (saved && THEME_IDS.has(saved)) return saved as Theme;
  } catch {}
  return 'forest';
}

const VALID_NUMBER_SIZES = new Set<string>(['small', 'medium', 'large']);
const VALID_SUPPORTS = new Set<string>(['full', 'some', 'none']);
const VALID_INPUT_MODES = new Set<string>(['random', 'custom']);

function loadNumberSize(): NumberSize {
  try {
    const saved = localStorage.getItem('maths-steps-numberSize');
    if (saved && VALID_NUMBER_SIZES.has(saved)) return saved as NumberSize;
    const oldDiff = localStorage.getItem('maths-steps-difficulty');
    if (oldDiff === 'easy' || oldDiff === 'medium' || oldDiff === 'hard') {
      const mapped = difficultyToSettings(oldDiff);
      localStorage.setItem('maths-steps-numberSize', mapped.numberSize);
      return mapped.numberSize;
    }
  } catch {}
  return 'medium';
}

function loadSupport(): Support {
  try {
    const saved = localStorage.getItem('maths-steps-support');
    if (saved && VALID_SUPPORTS.has(saved)) return saved as Support;
    const oldDiff = localStorage.getItem('maths-steps-difficulty');
    if (oldDiff === 'easy' || oldDiff === 'medium' || oldDiff === 'hard') {
      const mapped = difficultyToSettings(oldDiff);
      localStorage.setItem('maths-steps-support', mapped.support);
      return mapped.support;
    }
  } catch {}
  return 'some';
}

function loadInputMode(): InputMode {
  try {
    const saved = localStorage.getItem('maths-steps-inputMode');
    if (saved && VALID_INPUT_MODES.has(saved)) return saved as InputMode;
  } catch {}
  return 'random';
}

export const useUiStore = create<UiStore>((set, get) => ({
  screen: 'home',
  theme: loadTheme(),
  numberSize: loadNumberSize(),
  support: loadSupport(),
  inputMode: loadInputMode(),
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
  setNumberSize: (numberSize) => {
    localStorage.setItem('maths-steps-numberSize', numberSize);
    set({ numberSize });
  },
  setSupport: (support) => {
    localStorage.setItem('maths-steps-support', support);
    set({ support });
  },
  setInputMode: (inputMode) => {
    localStorage.setItem('maths-steps-inputMode', inputMode);
    set({ inputMode });
  },
  setOperation: (operation) => set({ operation }),
}));
