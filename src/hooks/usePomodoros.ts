import { useState, useRef, useCallback } from 'react';
import { PomodoroRepository } from '../services/PomodoroRepository';
import { getStorageService } from '../services/StorageService';
import { generateId } from '../utils/id';
import type { PomodoroSession, SessionType } from '../types';

export interface UsePomodorosResult {
  sessions: PomodoroSession[];
  addSession: (type: SessionType, projectId: string | null) => PomodoroSession;
  completeSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

export function usePomodoros(): UsePomodorosResult {
  const repoRef = useRef<PomodoroRepository | null>(null);
  if (repoRef.current === null) {
    repoRef.current = new PomodoroRepository(getStorageService());
  }
  const repo = repoRef.current;

  const [sessions, setSessions] = useState<PomodoroSession[]>(() => repo.findAll());

  const addSession = useCallback(
    (type: SessionType, projectId: string | null): PomodoroSession => {
      const session: PomodoroSession = {
        id: generateId(),
        type,
        projectId,
        startTime: new Date().toISOString(),
        endTime: null,
        completed: false,
      };
      repo.save(session);
      setSessions((prev) => [...prev, session]);
      return session;
    },
    [repo],
  );

  const completeSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        return prev.map((s) => {
          if (s.id !== id) return s;
          const updated: PomodoroSession = {
            ...s,
            completed: true,
            endTime: new Date().toISOString(),
          };
          repo.save(updated);
          return updated;
        });
      });
    },
    [repo],
  );

  const deleteSession = useCallback(
    (id: string) => {
      repo.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [repo],
  );

  return { sessions, addSession, completeSession, deleteSession };
}
