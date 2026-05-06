import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';
import { DEFAULT_SETTINGS } from '../types';
import { timerService } from '../services/TimerService';

// playBeep uses AudioContext which is unavailable in jsdom — mock it out.
vi.mock('../utils/sound', () => ({ playBeep: vi.fn() }));

// Settings with a 1-minute work session used for completion tests so we only
// need to advance 60 seconds instead of the full 25-minute default.
const FAST_SETTINGS = {
  ...DEFAULT_SETTINGS,
  workDuration: 1,       // 1 min = 60 ticks
  shortBreakDuration: 1, // 1 min = 60 ticks
  soundEnabled: false,   // no sound side-effects
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  // Stop the singleton timer so its internal state is clean for the next test,
  // then restore real timers.
  timerService.stop();
  vi.useRealTimers();
});

describe('useTimer', () => {
  it('initial secondsLeft equals DEFAULT_SETTINGS.workDuration * 60', () => {
    const { result } = renderHook(() =>
      useTimer({ settings: DEFAULT_SETTINGS }),
    );
    expect(result.current.secondsLeft).toBe(DEFAULT_SETTINGS.workDuration * 60);
  });

  it('start() causes secondsLeft to decrease by 1 per second', () => {
    const { result } = renderHook(() => useTimer({ settings: FAST_SETTINGS }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000); // 3 ticks
    });

    expect(result.current.secondsLeft).toBe(FAST_SETTINGS.workDuration * 60 - 3);
    expect(result.current.isRunning).toBe(true);
  });

  it('pause() stops the countdown', () => {
    const { result } = renderHook(() => useTimer({ settings: FAST_SETTINGS }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000); // count down 5 seconds
    });

    act(() => {
      result.current.pause();
    });

    const secondsAfterPause = result.current.secondsLeft;
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000); // more time passes — should have no effect
    });

    expect(result.current.secondsLeft).toBe(secondsAfterPause);
  });

  it('reset() restores secondsLeft to the current mode duration', () => {
    const { result } = renderHook(() => useTimer({ settings: FAST_SETTINGS }));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(10000); // count down 10 seconds
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.secondsLeft).toBe(FAST_SETTINGS.workDuration * 60);
    expect(result.current.isRunning).toBe(false);
  });

  it('skip() advances mode from work to short-break', () => {
    const { result } = renderHook(() => useTimer({ settings: FAST_SETTINGS }));

    expect(result.current.mode).toBe('work');

    act(() => {
      result.current.skip();
    });

    expect(result.current.mode).toBe('short-break');
    expect(result.current.isRunning).toBe(false);
    // secondsLeft should now reflect the short-break duration.
    expect(result.current.secondsLeft).toBe(FAST_SETTINGS.shortBreakDuration * 60);
  });

  it('pomodoroCount increments after a full work session completes', () => {
    const { result } = renderHook(() => useTimer({ settings: FAST_SETTINGS }));

    expect(result.current.pomodoroCount).toBe(0);

    act(() => {
      result.current.start();
    });

    // Advance exactly workDuration minutes to trigger the zero-crossing tick.
    act(() => {
      vi.advanceTimersByTime(FAST_SETTINGS.workDuration * 60 * 1000);
    });

    expect(result.current.pomodoroCount).toBe(1);
    // Mode should have advanced to short-break.
    expect(result.current.mode).toBe('short-break');
  });

  it('onComplete callback is called when the timer reaches 0', () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useTimer({ settings: FAST_SETTINGS, onComplete }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(FAST_SETTINGS.workDuration * 60 * 1000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('work');
  });
});
