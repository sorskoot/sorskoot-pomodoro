import type { SessionType } from '../../types';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  mode: SessionType;
  onChange: (mode: SessionType) => void;
}

const TABS: { label: string; value: SessionType }[] = [
  { label: 'Pomodoro', value: 'work' },
  { label: 'Short Break', value: 'short-break' },
  { label: 'Long Break', value: 'long-break' },
];

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          className={`${styles.tab} ${mode === tab.value ? styles.active : ''}`}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
