import { useUiStore } from '../../stores/uiStore';
import { useScore } from '../../hooks/useScore';
import styles from './Header.module.css';

export function Header() {
  const { screen, setScreen, theme, toggleTheme } = useUiStore();
  const { score } = useScore();
  const showBack = screen !== 'home';

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
            ←
          </button>
        )}
        <div className={styles.title}>Maths Steps</div>
      </div>
      <div className={styles.right}>
        <div className={styles.score}>{score.totalCorrect}</div>
        <button
          className={styles.themeButton}
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === 'forest' ? 'ocean' : 'forest'} theme`}
        >
          {theme === 'forest' ? '🌊' : '🌲'}
        </button>
      </div>
    </header>
  );
}
