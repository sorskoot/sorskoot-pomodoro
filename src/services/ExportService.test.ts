import { ExportService } from './ExportService';
import { DEFAULT_SETTINGS, type AppData, type PomodoroSession, type Project, type Settings } from '../types';
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

const sampleProject: Project = {
  id: 'proj-1',
  name: 'My Project',
  color: '#aabbcc',
  createdAt: '2024-01-01T00:00:00.000Z',
  archived: false,
};

const sampleSession: PomodoroSession = {
  id: 'sess-1',
  projectId: 'proj-1',
  type: 'work',
  startTime: '2024-01-01T09:00:00.000Z',
  endTime: '2024-01-01T09:25:00.000Z',
  completed: true,
};

const sampleSettings: Settings = {
  ...DEFAULT_SETTINGS,
  workDuration: 30,
};

describe('ExportService', () => {
  let storage: IStorageService;
  let service: ExportService;

  beforeEach(() => {
    storage = createMockStorage();
    service = new ExportService(storage);
  });

  // ── exportData ─────────────────────────────────────────────────────────────

  describe('exportData()', () => {
    it('returns AppData with the correct shape when storage is empty', () => {
      const result = service.exportData();

      expect(result).toMatchObject({
        version: expect.any(String),
        settings: DEFAULT_SETTINGS,
        projects: [],
        sessions: [],
        exportedAt: expect.any(String),
      });
    });

    it('includes settings stored under pomodoro_settings', () => {
      storage.set('pomodoro_settings', sampleSettings);

      const result = service.exportData();

      expect(result.settings).toEqual(sampleSettings);
    });

    it('includes projects stored under pomodoro_projects', () => {
      storage.set('pomodoro_projects', [sampleProject]);

      const result = service.exportData();

      expect(result.projects).toEqual([sampleProject]);
    });

    it('includes sessions stored under pomodoro_sessions', () => {
      storage.set('pomodoro_sessions', [sampleSession]);

      const result = service.exportData();

      expect(result.sessions).toEqual([sampleSession]);
    });

    it('exportedAt is a valid ISO date string', () => {
      const result = service.exportData();

      expect(() => new Date(result.exportedAt)).not.toThrow();
      expect(new Date(result.exportedAt).toISOString()).toBe(result.exportedAt);
    });
  });

  // ── importData ─────────────────────────────────────────────────────────────

  describe('importData()', () => {
    const validPayload: AppData = {
      version: '1.0',
      settings: sampleSettings,
      projects: [sampleProject],
      sessions: [sampleSession],
      exportedAt: '2024-01-01T12:00:00.000Z',
    };

    it('writes settings to storage', () => {
      service.importData(validPayload);

      expect(storage.get('pomodoro_settings')).toEqual(sampleSettings);
    });

    it('writes projects to storage', () => {
      service.importData(validPayload);

      expect(storage.get('pomodoro_projects')).toEqual([sampleProject]);
    });

    it('writes sessions to storage', () => {
      service.importData(validPayload);

      expect(storage.get('pomodoro_sessions')).toEqual([sampleSession]);
    });

    it('returns the imported AppData', () => {
      const result = service.importData(validPayload);

      expect(result).toEqual(validPayload);
    });

    it('throws when the input is not an object (null)', () => {
      expect(() => service.importData(null)).toThrow('Invalid import data');
    });

    it('throws when the input is not an object (primitive)', () => {
      expect(() => service.importData(42)).toThrow('Invalid import data');
    });

    it('throws when required field "version" is missing', () => {
      const bad = { settings: sampleSettings, projects: [], sessions: [] };
      expect(() => service.importData(bad)).toThrow('Invalid import data');
    });

    it('throws when required field "settings" is missing', () => {
      const bad = { version: '1.0', projects: [], sessions: [] };
      expect(() => service.importData(bad)).toThrow('Invalid import data');
    });

    it('throws when "projects" is not an array', () => {
      const bad = { version: '1.0', settings: sampleSettings, projects: 'oops', sessions: [] };
      expect(() => service.importData(bad)).toThrow('Invalid import data');
    });

    it('throws when "sessions" is not an array', () => {
      const bad = { version: '1.0', settings: sampleSettings, projects: [], sessions: null };
      expect(() => service.importData(bad)).toThrow('Invalid import data');
    });
  });
});
