import type { ChangeEvent } from 'react';
import type { Project } from '../../types';
import styles from './ProjectSelector.module.css';

interface ProjectSelectorProps {
  projects: Project[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export default function ProjectSelector({ projects, selectedId, onChange }: ProjectSelectorProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    onChange(value === '' ? null : value);
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="project-select">
        Project:
      </label>
      <select
        id="project-select"
        className={styles.select}
        value={selectedId ?? ''}
        onChange={handleChange}
      >
        <option value="">No Project</option>
        {projects
          .filter((p) => !p.archived)
          .map((project) => (
            <option key={project.id} value={project.id} style={{ color: project.color }}>
              ■ {project.name}
            </option>
          ))}
      </select>
    </div>
  );
}
