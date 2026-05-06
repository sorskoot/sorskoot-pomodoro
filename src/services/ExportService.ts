import type { IExportService } from './interfaces/IExportService';
import type { IStorageService } from './interfaces/IStorageService';
import type { AppData, PomodoroSession, Project, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const APP_VERSION = '1.0';

export class ExportService implements IExportService {
  constructor(private readonly storage: IStorageService) {}

  exportData(): AppData {
    return {
      version: APP_VERSION,
      settings: this.storage.get<Settings>('pomodoro_settings') ?? { ...DEFAULT_SETTINGS },
      projects: this.storage.get<Project[]>('pomodoro_projects') ?? [],
      sessions: this.storage.get<PomodoroSession[]>('pomodoro_sessions') ?? [],
      exportedAt: new Date().toISOString(),
    };
  }

  importData(data: unknown): AppData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data: not an object');
    }
    const obj = data as Record<string, unknown>;
    if (!obj.version || !obj.settings || !Array.isArray(obj.projects) || !Array.isArray(obj.sessions)) {
      throw new Error('Invalid import data: missing required fields');
    }
    const appData = data as AppData;
    this.storage.set('pomodoro_settings', appData.settings);
    this.storage.set('pomodoro_projects', appData.projects);
    this.storage.set('pomodoro_sessions', appData.sessions);
    return appData;
  }
}
