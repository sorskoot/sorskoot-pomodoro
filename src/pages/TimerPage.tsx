import { useState, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTimer } from '../hooks/useTimer';
import { useProjects } from '../hooks/useProjects';
import { usePomodoros } from '../hooks/usePomodoros';
import ModeSelector from '../components/ModeSelector';
import Timer from '../components/Timer';
import ProjectSelector from '../components/ProjectSelector';
import type { SessionType } from '../types';
import type { Settings } from '../types';
import styles from './TimerPage.module.css';

function getTotalSeconds(mode: SessionType, settings: Settings): number {
  if (mode === 'work') return settings.workDuration * 60;
  if (mode === 'short-break') return settings.shortBreakDuration * 60;
  return settings.longBreakDuration * 60;
}

export default function TimerPage() {
  const { settings } = useSettings();
  const { projects } = useProjects();
  const { addSession, completeSession } = usePomodoros();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleComplete = useCallback(
    (completedMode: SessionType) => {
      // Record the completed session immediately upon completion.
      const session = addSession(completedMode, selectedProjectId);
      completeSession(session.id);
    },
    [addSession, completeSession, selectedProjectId],
  );

  const timer = useTimer({ settings, onComplete: handleComplete });

  const totalSeconds = getTotalSeconds(timer.mode, settings);

  return (
    <div className={styles.page}>
      <ModeSelector mode={timer.mode} onChange={timer.changeMode} />
      <Timer
        secondsLeft={timer.secondsLeft}
        totalSeconds={totalSeconds}
        isRunning={timer.isRunning}
        mode={timer.mode}
        pomodoroCount={timer.pomodoroCount}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={timer.reset}
        onSkip={timer.skip}
      />
      <ProjectSelector
        projects={projects}
        selectedId={selectedProjectId}
        onChange={setSelectedProjectId}
      />
    </div>
  );
}
