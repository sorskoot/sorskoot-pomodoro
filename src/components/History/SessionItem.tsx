import type { PomodoroSession } from '../../types';
import styles from './SessionItem.module.css';

interface SessionItemProps {
  session: PomodoroSession;
  projectName: string | null;
}

function formatTimeRange(isoStart: string, isoEnd: string | null): string {
  const start = new Date(isoStart).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (!isoEnd) return start;
  const end = new Date(isoEnd).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${start} – ${end}`;
}

export default function SessionItem({ session, projectName }: SessionItemProps) {
  const isWork = session.type === 'work';
  const icon = isWork ? '🍅' : '☕';

  return (
    <div className={styles.row}>
      <span className={styles.icon} title={session.type}>
        {icon}
      </span>
      <span className={styles.timeRange}>
        {formatTimeRange(session.startTime, session.endTime)}
      </span>
      <span className={projectName ? styles.projectName : `${styles.projectName} ${styles.noProject}`}>
        {projectName ?? 'No project'}
      </span>
      <span
        className={`${styles.badge} ${
          session.completed ? styles.badgeCompleted : styles.badgeIncomplete
        }`}
      >
        {session.completed ? 'Done' : 'Incomplete'}
      </span>
    </div>
  );
}
