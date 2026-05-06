import { useState, useRef, useCallback } from 'react';
import { SettingsRepository } from '../services/SettingsRepository';
import { storageService } from '../services/StorageService';
import type { Settings } from '../types';

export interface UseSettingsResult {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

export function useSettings(): UseSettingsResult {
  const repoRef = useRef<SettingsRepository | null>(null);
  if (repoRef.current === null) {
    repoRef.current = new SettingsRepository(storageService);
  }
  const repo = repoRef.current;

  const [settings, setSettings] = useState<Settings>(() => repo.load());

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        repo.save(next);
        return next;
      });
    },
    [repo],
  );

  return { settings, updateSettings };
}
