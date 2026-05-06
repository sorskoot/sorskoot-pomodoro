export interface Settings {
  workDuration: number;       // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number;  // minutes
  longBreakInterval: number;  // pomodoros before long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
};

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  archived: boolean;
}

export type SessionType = 'work' | 'short-break' | 'long-break';

export interface PomodoroSession {
  id: string;
  projectId: string | null;
  type: SessionType;
  startTime: string;
  endTime: string | null;
  completed: boolean;
}

export interface AppData {
  version: string;
  settings: Settings;
  projects: Project[];
  sessions: PomodoroSession[];
  exportedAt: string;
}
