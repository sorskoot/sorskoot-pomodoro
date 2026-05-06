import { ProjectRepository } from './ProjectRepository';
import type { Project } from '../types';
import type { IStorageService } from './interfaces/IStorageService';

function createMockStorage() {
  const store: Record<string, string> = {};
  return {
    get: <T>(key: string): T | null => {
      const v = store[key];
      return v !== undefined ? (JSON.parse(v) as T) : null;
    },
    set: <T>(key: string, value: T) => {
      store[key] = JSON.stringify(value);
    },
    remove: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  } satisfies IStorageService;
}

function makeProject(id: string, overrides: Partial<Project> = {}): Project {
  return {
    id,
    name: `Project ${id}`,
    color: '#ff0000',
    createdAt: new Date().toISOString(),
    archived: false,
    ...overrides,
  };
}

describe('ProjectRepository', () => {
  let storage: IStorageService;
  let repo: ProjectRepository;

  beforeEach(() => {
    storage = createMockStorage();
    repo = new ProjectRepository(storage);
  });

  it('findAll() returns an empty array when nothing is stored', () => {
    expect(repo.findAll()).toEqual([]);
  });

  it('save() adds a new project', () => {
    const project = makeProject('p1');
    repo.save(project);

    expect(repo.findAll()).toEqual([project]);
  });

  it('save() updates an existing project (upsert)', () => {
    const project = makeProject('p1');
    repo.save(project);

    const updated = { ...project, name: 'Updated Name' };
    repo.save(updated);

    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Updated Name');
  });

  it('save() can store multiple projects', () => {
    repo.save(makeProject('p1'));
    repo.save(makeProject('p2'));
    repo.save(makeProject('p3'));

    expect(repo.findAll()).toHaveLength(3);
  });

  it('findById() returns the matching project', () => {
    const p1 = makeProject('p1');
    const p2 = makeProject('p2');
    repo.save(p1);
    repo.save(p2);

    expect(repo.findById('p2')).toEqual(p2);
  });

  it('findById() returns undefined for an unknown id', () => {
    repo.save(makeProject('p1'));

    expect(repo.findById('nonexistent')).toBeUndefined();
  });

  it('delete() removes the specified project', () => {
    repo.save(makeProject('p1'));
    repo.save(makeProject('p2'));

    repo.delete('p1');

    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('p2');
  });

  it('delete() is a no-op for an unknown id', () => {
    repo.save(makeProject('p1'));

    repo.delete('ghost');

    expect(repo.findAll()).toHaveLength(1);
  });
});
