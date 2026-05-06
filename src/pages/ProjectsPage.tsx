import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { usePomodoros } from '../hooks/usePomodoros';
import { ProjectForm, ProjectItem } from '../components/Projects';
import type { Project } from '../types';
import styles from './ProjectsPage.module.css';

type FormState =
  | { mode: 'hidden' }
  | { mode: 'add' }
  | { mode: 'edit'; project: Project };

export default function ProjectsPage() {
  const { projects, addProject, updateProject, archiveProject, deleteProject } = useProjects();
  const { sessions } = usePomodoros();
  const [formState, setFormState] = useState<FormState>({ mode: 'hidden' });

  function getSessionCount(projectId: string): number {
    return sessions.filter((s) => s.projectId === projectId && s.completed).length;
  }

  function handleAdd(name: string, color: string) {
    addProject(name, color);
    setFormState({ mode: 'hidden' });
  }

  function handleEdit(project: Project, name: string, color: string) {
    updateProject(project.id, { name, color });
    setFormState({ mode: 'hidden' });
  }

  function handleArchive(project: Project) {
    if (window.confirm(`Archive "${project.name}"? It will be hidden from the project list.`)) {
      archiveProject(project.id);
    }
  }

  function handleDelete(project: Project) {
    if (
      window.confirm(
        `Delete "${project.name}"? This cannot be undone. Sessions tied to this project will keep their data but lose the project reference.`,
      )
    ) {
      deleteProject(project.id);
    }
  }

  const isEditing = (id: string) => formState.mode === 'edit' && formState.project.id === id;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        {formState.mode === 'hidden' && (
          <button
            className={styles.addBtn}
            type="button"
            onClick={() => setFormState({ mode: 'add' })}
          >
            + Add Project
          </button>
        )}
      </div>

      {formState.mode === 'add' && (
        <ProjectForm
          onSubmit={handleAdd}
          onCancel={() => setFormState({ mode: 'hidden' })}
        />
      )}

      {projects.length === 0 && formState.mode !== 'add' && (
        <p className={styles.empty}>No projects yet. Add one to start tracking your work.</p>
      )}

      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.id}>
            {isEditing(project.id) ? (
              <ProjectForm
                initial={project}
                onSubmit={(name, color) => handleEdit(project, name, color)}
                onCancel={() => setFormState({ mode: 'hidden' })}
              />
            ) : (
              <ProjectItem
                project={project}
                sessionCount={getSessionCount(project.id)}
                onEdit={() => setFormState({ mode: 'edit', project })}
                onArchive={() => handleArchive(project)}
                onDelete={() => handleDelete(project)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
