import ProgressRing from './ProgressRing';
import { formatTime } from '../../utils/time';
import type { SessionType } from '../../types';
import styles from './Timer.module.css';

interface TimerProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: SessionType;
  pomodoroCount: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const MODE_LABELS: Record<SessionType, string> = {
  work: 'Work',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

// Total dots shown matches the long break interval (4 pomodoros per cycle).
const DOTS_COUNT = 4;

export default function Timer({
  secondsLeft,
  totalSeconds,
  isRunning,
  mode,
  pomodoroCount,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const filledDots = Math.min(pomodoroCount % DOTS_COUNT, DOTS_COUNT);

  return (
    <div className={styles.container}>
      <div className={styles.modeLabel}>{MODE_LABELS[mode]}</div>

      <div className={styles.ringWrapper}>
        <ProgressRing progress={progress} />
        <div className={styles.timeDisplay}>{formatTime(secondsLeft)}</div>
      </div>

      <div className={styles.controls}>
        <button className={styles.secondaryBtn} onClick={onReset} type="button" title="Reset">
          ⟳
        </button>
        <button
          className={styles.primaryBtn}
          onClick={isRunning ? onPause : onStart}
          type="button"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className={styles.secondaryBtn} onClick={onSkip} type="button" title="Skip">
          ⏭
        </button>
      </div>

      <div className={styles.dots}>
        {Array.from({ length: DOTS_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < filledDots ? styles.dotFilled : styles.dotEmpty}`}
          >
            {i < filledDots ? '●' : '○'}
          </span>
        ))}
      </div>
    </div>
  );
}
