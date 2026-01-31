import { useState, useRef, useEffect, useCallback } from 'react';
import { useUiStore, THEMES } from '../../stores/uiStore';
import { useScore } from '../../hooks/useScore';
import styles from './Header.module.css';

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const supported = !!document.documentElement.requestFullscreen;

  return { isFullscreen, toggle, supported };
}

export function Header() {
  const { screen, setScreen, theme, setTheme } = useUiStore();
  const { score } = useScore();
  const showBack = screen !== 'home';
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen, supported: fsSupported } = useFullscreen();

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
        {fsSupported && (
          <button
            className={styles.fullscreenButton}
            onClick={toggleFullscreen}
            type="button"
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        )}
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
