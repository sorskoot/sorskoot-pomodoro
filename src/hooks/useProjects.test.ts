import { renderHook, act } from '@testing-library/react';
import { useProjects } from './useProjects';

beforeEach(() => {
  localStorage.clear();
});

describe('useProjects', () => {
  it('projects is empty initially', () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.projects).toEqual([]);
  });

  it('addProject adds a project with correct fields', () => {
    const { result } = renderHook(() => useProjects());

    act(() => {
      result.current.addProject('My project', '#ff0000');
    });

    expect(result.current.projects).toHaveLength(1);
    const p = result.current.projects[0];
    expect(p.name).toBe('My project');
    expect(p.color).toBe('#ff0000');
    expect(p.archived).toBe(false);
    expect(typeof p.id).toBe('string');
    expect(p.id.length).toBeGreaterThan(0);
    expect(typeof p.createdAt).toBe('string');
    expect(p.createdAt.length).toBeGreaterThan(0);
  });

  it('archiveProject removes the project from the returned list but keeps it in storage', () => {
    const { result } = renderHook(() => useProjects());

    act(() => {
      result.current.addProject('My project', '#ff0000');
    });
    const id = result.current.projects[0].id;

    act(() => {
      result.current.archiveProject(id);
    });

    // Archived projects are filtered out of the public list.
    expect(result.current.projects).toHaveLength(0);

    // But the record still exists in localStorage (archived flag set).
    const stored: Array<{ id: string; archived: boolean }> = JSON.parse(
      localStorage.getItem('pomodoro_projects')!,
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].archived).toBe(true);
  });

  it('deleteProject removes the project from storage entirely', () => {
    const { result } = renderHook(() => useProjects());

    act(() => {
      result.current.addProject('My project', '#ff0000');
    });
    const id = result.current.projects[0].id;

    act(() => {
      result.current.deleteProject(id);
    });

    expect(result.current.projects).toHaveLength(0);

    const stored: unknown[] = JSON.parse(localStorage.getItem('pomodoro_projects')!);
    expect(stored).toHaveLength(0);
  });

  it('updateProject updates the name', () => {
    const { result } = renderHook(() => useProjects());

    act(() => {
      result.current.addProject('My project', '#ff0000');
    });
    const id = result.current.projects[0].id;

    act(() => {
      result.current.updateProject(id, { name: 'New name' });
    });

    expect(result.current.projects[0].name).toBe('New name');
    // Other fields are preserved.
    expect(result.current.projects[0].color).toBe('#ff0000');
  });
});
