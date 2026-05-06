import type { Project } from '../../types';
import styles from './ProjectItem.module.css';

interface ProjectItemProps {
  project: Project;
  sessionCount: number;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export default function ProjectItem({
  project,
  sessionCount,
  onEdit,
  onArchive,
  onDelete,
}: ProjectItemProps) {
  return (
    <div className={styles.row}>
      <span
        className={styles.dot}
        style={{ backgroundColor: project.color }}
        aria-hidden="true"
      />
      <span className={styles.name} title={project.name}>
        {project.name}
      </span>
      <span className={styles.sessionCount}>
        {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
      </span>
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={onEdit} type="button" title="Edit project">
          ✏️
        </button>
        <button
          className={styles.iconBtn}
          onClick={onArchive}
          type="button"
          title="Archive project"
        >
          📦
        </button>
        <button
          className={`${styles.iconBtn} ${styles.deleteBtn}`}
          onClick={onDelete}
          type="button"
          title="Delete project"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
