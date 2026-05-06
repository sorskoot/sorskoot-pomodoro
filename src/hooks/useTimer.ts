import { useState, useRef, useCallback, useEffect } from 'react';
import { timerService } from '../services/TimerService';
import { playBeep } from '../utils/sound';
import type { Settings, SessionType } from '../types';

export interface UseTimerOptions {
  settings: Settings;
  onComplete?: (mode: SessionType) => void;
}

export interface UseTimerResult {
  secondsLeft: number;
  isRunning: boolean;
  mode: SessionType;
  pomodoroCount: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  changeMode: (mode: SessionType) => void;
}

/** Returns the duration in seconds for the given mode and settings. */
function durationFor(mode: SessionType, settings: Settings): number {
  if (mode === 'work') return settings.workDuration * 60;
  if (mode === 'short-break') return settings.shortBreakDuration * 60;
  return settings.longBreakDuration * 60;
}

/**
 * Determines the next mode after the current one completes.
 * After every `longBreakInterval` work sessions, a long break is inserted.
 * `pomodoroCount` is the number of *completed* work sessions so far (before
 * incrementing for the one that just finished).
 */
function nextMode(current: SessionType, pomodoroCount: number, settings: Settings): SessionType {
  if (current !== 'work') {
    // After any break, always go back to work.
    return 'work';
  }
  // Increment happens before this call in the effect, so we use the
  // already-updated count passed in.
  const newCount = pomodoroCount + 1;
  return newCount % settings.longBreakInterval === 0 ? 'long-break' : 'short-break';
}

export function useTimer({ settings, onComplete }: UseTimerOptions): UseTimerResult {
  const [mode, setMode] = useState<SessionType>('work');
  const [secondsLeft, setSecondsLeft] = useState<number>(durationFor('work', settings));
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Keep stable refs so the tick closure always sees the latest values without
  // needing to restart the interval.
  const modeRef = useRef(mode);
  const secondsLeftRef = useRef(secondsLeft);
  const pomodoroCountRef = useRef(pomodoroCount);
  const settingsRef = useRef(settings);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);
  useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // When settings change, reset the timer to the new duration for the current mode
  // only if it is not currently running.
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(durationFor(mode, settings));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  /** Advance to the next mode, optionally auto-starting it. */
  const advanceMode = useCallback((autoStart: boolean) => {
    const currentMode = modeRef.current;
    const currentCount = pomodoroCountRef.current;
    const currentSettings = settingsRef.current;

    let newCount = currentCount;
    if (currentMode === 'work') {
      newCount = currentCount + 1;
      setPomodoroCount(newCount);
      pomodoroCountRef.current = newCount;
    }

    const next = nextMode(currentMode, currentCount, currentSettings);
    const nextSeconds = durationFor(next, currentSettings);

    setMode(next);
    modeRef.current = next;
    setSecondsLeft(nextSeconds);
    secondsLeftRef.current = nextSeconds;

    if (autoStart) {
      // timerService may already be stopped; start fresh.
      timerService.stop();
      timerService.start(tick);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  // tick is defined below and never changes identity — safe to reference via closure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Called every second by timerService. */
  const tick = useCallback(() => {
    const next = secondsLeftRef.current - 1;
    if (next > 0) {
      setSecondsLeft(next);
      secondsLeftRef.current = next;
      return;
    }

    // Timer hit zero — stop the service, then handle completion.
    timerService.stop();
    setSecondsLeft(0);
    secondsLeftRef.current = 0;
    setIsRunning(false);

    const completedMode = modeRef.current;
    const currentSettings = settingsRef.current;

    // Fire callback.
    onCompleteRef.current?.(completedMode);

    // Play sound.
    if (currentSettings.soundEnabled) {
      playBeep();
    }

    // Determine whether to auto-advance.
    const shouldAutoStart =
      completedMode === 'work'
        ? currentSettings.autoStartBreaks
        : currentSettings.autoStartPomodoros;

    advanceMode(shouldAutoStart);
  }, [advanceMode]);

  const start = useCallback(() => {
    if (timerService.isRunning()) return;
    timerService.start(tick);
    setIsRunning(true);
  }, [tick]);

  const pause = useCallback(() => {
    timerService.stop();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    timerService.stop();
    setIsRunning(false);
    const duration = durationFor(modeRef.current, settingsRef.current);
    setSecondsLeft(duration);
    secondsLeftRef.current = duration;
  }, []);

  const skip = useCallback(() => {
    timerService.stop();
    setIsRunning(false);
    // Advance without triggering callback or sound.
    const currentMode = modeRef.current;
    const currentCount = pomodoroCountRef.current;
    const currentSettings = settingsRef.current;

    let newCount = currentCount;
    if (currentMode === 'work') {
      newCount = currentCount + 1;
      setPomodoroCount(newCount);
      pomodoroCountRef.current = newCount;
    }

    const next = nextMode(currentMode, currentCount, currentSettings);
    const nextSeconds = durationFor(next, currentSettings);

    setMode(next);
    modeRef.current = next;
    setSecondsLeft(nextSeconds);
    secondsLeftRef.current = nextSeconds;
  }, []);

  /** Stop the timer and jump directly to the given mode, resetting the clock. */
  const changeMode = useCallback((newMode: SessionType) => {
    timerService.stop();
    setIsRunning(false);
    const duration = durationFor(newMode, settingsRef.current);
    setMode(newMode);
    modeRef.current = newMode;
    setSecondsLeft(duration);
    secondsLeftRef.current = duration;
  }, []);

  // Clean up the interval when the component unmounts.
  useEffect(() => {
    return () => {
      timerService.stop();
    };
  }, []);

  return { secondsLeft, isRunning, mode, pomodoroCount, start, pause, reset, skip, changeMode };
}
