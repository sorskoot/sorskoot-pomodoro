import type { IRepository } from './interfaces/IRepository';
import type { IStorageService } from './interfaces/IStorageService';
import type { Project } from '../types';

const PROJECTS_KEY = 'pomodoro_projects';

export class ProjectRepository implements IRepository<Project> {
  constructor(private readonly storage: IStorageService) {}

  private load(): Project[] {
    return this.storage.get<Project[]>(PROJECTS_KEY) ?? [];
  }

  private persist(projects: Project[]): void {
    this.storage.set(PROJECTS_KEY, projects);
  }

  findAll(): Project[] {
    return this.load();
  }

  findById(id: string): Project | undefined {
    return this.load().find((p) => p.id === id);
  }

  save(project: Project): void {
    const projects = this.load();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    this.persist(projects);
  }

  delete(id: string): void {
    this.persist(this.load().filter((p) => p.id !== id));
  }
}
