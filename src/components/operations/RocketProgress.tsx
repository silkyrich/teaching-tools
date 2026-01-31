import styles from './RocketProgress.module.css';
import { useUiStore, type Theme } from '../../stores/uiStore';

interface RocketProgressProps {
  current: number;
  total: number;
}

// ── Per-theme SVG icons ──────────────────────────────────────────────

// Space: rocket → planet → star
function SpaceRocket() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 8 6 8 14l4 4 4-4c0-8-4-12-4-12z" fill="var(--color-primary)" stroke="var(--color-accent)" strokeWidth="1" />
      <circle cx="12" cy="10" r="2" fill="var(--color-accent)" opacity="0.7" />
      <path d="M8 14l-3 3 1 1 4-2z" fill="var(--color-primary)" opacity="0.8" />
      <path d="M16 14l3 3-1 1-4-2z" fill="var(--color-primary)" opacity="0.8" />
      <path d="M10 18l2 4 2-4" fill="var(--color-accent)" opacity="0.9" className={styles.flame} />
    </svg>
  );
}
function SpaceGoal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" fill="var(--color-surface-raised)" stroke="var(--color-primary)" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="12" ry="4" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" opacity="0.6" />
      <circle cx="10" cy="10" r="2" fill="var(--color-primary)" opacity="0.25" />
    </svg>
  );
}

// Forest: frog → lily pad → flower
function ForestTraveller() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <ellipse cx="12" cy="14" rx="6" ry="5" fill="var(--color-primary)" />
      {/* Eyes */}
      <circle cx="9" cy="9" r="3" fill="var(--color-primary)" />
      <circle cx="15" cy="9" r="3" fill="var(--color-primary)" />
      <circle cx="9" cy="8.5" r="1.5" fill="var(--color-accent)" />
      <circle cx="15" cy="8.5" r="1.5" fill="var(--color-accent)" />
      <circle cx="9.5" cy="8" r="0.6" fill="var(--color-surface-raised)" />
      <circle cx="15.5" cy="8" r="0.6" fill="var(--color-surface-raised)" />
      {/* Mouth */}
      <path d="M9 15q3 2 6 0" stroke="var(--color-accent)" strokeWidth="0.8" fill="none" />
      {/* Front legs */}
      <path d="M7 17l-2 3" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 17l2 3" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ForestGoal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Lily pad */}
      <ellipse cx="12" cy="16" rx="10" ry="5" fill="var(--color-primary)" opacity="0.4" />
      <ellipse cx="12" cy="15" rx="8" ry="4" fill="var(--color-primary)" opacity="0.6" />
      {/* Flower */}
      <circle cx="12" cy="8" r="3" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="9" cy="9" r="2.5" fill="var(--color-accent)" opacity="0.6" />
      <circle cx="15" cy="9" r="2.5" fill="var(--color-accent)" opacity="0.6" />
      <circle cx="12" cy="8" r="1.5" fill="var(--color-primary)" />
      {/* Stem */}
      <path d="M12 11v5" stroke="var(--color-primary)" strokeWidth="1.5" />
    </svg>
  );
}

// Ocean: fish → coral → treasure chest
function OceanTraveller() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <ellipse cx="11" cy="12" rx="7" ry="5" fill="var(--color-primary)" />
      {/* Tail */}
      <path d="M18 12l4-4v8z" fill="var(--color-accent)" opacity="0.8" />
      {/* Eye */}
      <circle cx="7" cy="11" r="1.5" fill="var(--color-surface-raised)" />
      <circle cx="6.7" cy="10.7" r="0.6" fill="var(--color-text)" />
      {/* Fin */}
      <path d="M11 7l1-3 2 3" fill="var(--color-accent)" opacity="0.7" />
      {/* Mouth */}
      <circle cx="4.5" cy="12.5" r="0.8" fill="var(--color-surface-raised)" opacity="0.5" />
    </svg>
  );
}
function OceanGoal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Coral branches */}
      <path d="M6 20q0-6 3-10" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9 10q2-3 2-6" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 10q-3-2-4-5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 20q0-5-2-8" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 12q3-3 5-4" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M18 20q0-4-1-7" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Candy: cupcake → jar → lollipop
function CandyTraveller() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Wrapper */}
      <path d="M6 14h12l-1 7H7z" fill="var(--color-primary)" />
      <path d="M6 14h12" stroke="var(--color-accent)" strokeWidth="1" />
      {/* Frosting */}
      <path d="M5 14q1-3 3.5-3t3.5 3q1-3 3.5-3t3.5 3" fill="var(--color-accent)" />
      {/* Cherry */}
      <circle cx="12" cy="8" r="2" fill="var(--color-primary)" stroke="var(--color-accent)" strokeWidth="0.5" />
      <path d="M12 6q1-2 3-2" stroke="var(--color-primary)" strokeWidth="0.7" fill="none" />
    </svg>
  );
}
function CandyGoal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Stick */}
      <rect x="11" y="14" width="2" height="8" rx="1" fill="var(--color-surface-raised)" stroke="var(--color-text-muted)" strokeWidth="0.5" />
      {/* Swirl */}
      <circle cx="12" cy="9" r="7" fill="var(--color-accent)" opacity="0.3" />
      <circle cx="12" cy="9" r="5" fill="var(--color-primary)" opacity="0.5" />
      <circle cx="12" cy="9" r="3" fill="var(--color-accent)" opacity="0.7" />
      <circle cx="12" cy="9" r="1.5" fill="var(--color-primary)" />
    </svg>
  );
}

// Volcano: fireball → volcano → diamond
function VolcanoTraveller() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Outer glow */}
      <circle cx="12" cy="12" r="8" fill="var(--color-accent)" opacity="0.25" />
      {/* Fire body */}
      <path d="M12 4q4 3 4 8c0 4-8 4-8 0q0-5 4-8z" fill="var(--color-primary)" />
      {/* Inner flame */}
      <path d="M12 8q2 2 2 5c0 2-4 2-4 0q0-3 2-5z" fill="var(--color-accent)" className={styles.flame} />
    </svg>
  );
}
function VolcanoGoal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Mountain */}
      <path d="M2 22L9 6h6l7 16z" fill="var(--color-surface-raised)" stroke="var(--color-primary)" strokeWidth="1" />
      {/* Crater */}
      <ellipse cx="12" cy="6" rx="3" ry="1.5" fill="var(--color-primary)" />
      {/* Lava glow */}
      <path d="M10 6q2-4 4 0" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" opacity="0.7" className={styles.flame} />
    </svg>
  );
}

// Arctic: penguin → igloo → snowflake
function ArcticTraveller() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <ellipse cx="12" cy="14" rx="5" ry="7" fill="var(--color-text)" />
      {/* Belly */}
      <ellipse cx="12" cy="15" rx="3" ry="5" fill="var(--color-surface-raised)" />
      {/* Head */}
      <circle cx="12" cy="7" r="4" fill="var(--color-text)" />
      {/* Eyes */}
      <circle cx="10.5" cy="6.5" r="0.8" fill="var(--color-surface-raised)" />
      <circle cx="13.5" cy="6.5" r="0.8" fill="var(--color-surface-raised)" />
      {/* Beak */}
      <path d="M11 8.5l1 1.5 1-1.5" fill="var(--color-accent)" />
      {/* Feet */}
      <ellipse cx="10" cy="21" rx="2" ry="0.8" fill="var(--color-accent)" />
      <ellipse cx="14" cy="21" rx="2" ry="0.8" fill="var(--color-accent)" />
    </svg>
  );
}
function ArcticGoal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Igloo dome */}
      <path d="M3 16a9 9 0 0118 0z" fill="var(--color-surface-raised)" stroke="var(--color-primary)" strokeWidth="1" />
      {/* Door */}
      <path d="M9 16a3 3 0 016 0v4H9z" fill="var(--color-primary)" opacity="0.5" />
      {/* Block lines */}
      <path d="M5 13h14" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.4" />
      <path d="M4 10h16" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.3" />
      {/* Ground */}
      <rect x="2" y="16" width="20" height="3" rx="1" fill="var(--color-surface-raised)" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

// ── Completion icon (shared star, theme-coloured) ────────────────────

function CompleteStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.9 5.9L21 9l-4.5 4.4L17.8 20 12 16.9 6.2 20l1.3-6.6L3 9l6.1-1.1z"
        fill="var(--color-accent)"
        stroke="var(--color-primary)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

// ── Registry ─────────────────────────────────────────────────────────

interface ThemeIcons {
  traveller: () => React.JSX.Element;
  goal: () => React.JSX.Element;
}

const THEME_ICONS: Record<Theme, ThemeIcons> = {
  space:   { traveller: SpaceRocket,      goal: SpaceGoal },
  forest:  { traveller: ForestTraveller,   goal: ForestGoal },
  ocean:   { traveller: OceanTraveller,    goal: OceanGoal },
  candy:   { traveller: CandyTraveller,    goal: CandyGoal },
  volcano: { traveller: VolcanoTraveller,  goal: VolcanoGoal },
  arctic:  { traveller: ArcticTraveller,   goal: ArcticGoal },
};

// ── Component ────────────────────────────────────────────────────────

export function RocketProgress({ current, total }: RocketProgressProps) {
  const theme = useUiStore(s => s.theme);
  const progress = total > 0 ? Math.min(current / total, 1) : 0;
  const isComplete = current >= total;
  const icons = THEME_ICONS[theme];
  const Traveller = icons.traveller;
  const Goal = icons.goal;

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        {Array.from({ length: Math.min(total, 12) }, (_, i) => {
          const pos = ((i + 1) / total) * 100;
          const done = (i + 1) <= current;
          return (
            <div
              key={i}
              className={`${styles.dot} ${done ? styles.dotDone : ''}`}
              style={{ left: `${pos}%` }}
            />
          );
        })}
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      <div
        className={`${styles.rocket} ${isComplete ? styles.rocketLanded : ''}`}
        style={{ left: `${progress * 100}%` }}
      >
        <Traveller />
      </div>
      <div className={styles.planet}>
        {isComplete ? <CompleteStar /> : <Goal />}
      </div>
    </div>
  );
}
