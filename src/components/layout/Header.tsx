import { useState, useRef, useEffect } from 'react';
import { useUiStore, THEMES } from '../../stores/uiStore';
import { useScore } from '../../hooks/useScore';
import styles from './Header.module.css';

export function Header() {
  const { screen, setScreen, theme, setTheme } = useUiStore();
  const { score } = useScore();
  const showBack = screen !== 'home';
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find(t => t.id === theme)!;

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && (
          <button
            className={styles.backButton}
            onClick={() => setScreen('home')}
            type="button"
            aria-label="Back to home"
          >
            &larr;
          </button>
        )}
        <div className={styles.title}>Maths Steps</div>
      </div>
      <div className={styles.right}>
        <div className={styles.score}>{score.totalCorrect}</div>
        <div className={styles.themePickerWrap} ref={pickerRef}>
          <button
            className={styles.themeButton}
            onClick={() => setPickerOpen(o => !o)}
            type="button"
            aria-label="Choose theme"
            aria-expanded={pickerOpen}
          >
            {currentTheme.icon}
          </button>
          {pickerOpen && (
            <div className={styles.themePicker}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.themeOption} ${t.id === theme ? styles.themeOptionActive : ''}`}
                  onClick={() => { setTheme(t.id); setPickerOpen(false); }}
                  type="button"
                  aria-label={`${t.label} theme`}
                >
                  <span className={styles.themeIcon}>{t.icon}</span>
                  <span className={styles.themeLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
