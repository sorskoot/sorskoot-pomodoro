/**
 * Regression tests for the useTimer auto-start closure fix.
 *
 * The fix: advanceMode passes `() => tickRef.current()` to timerService.start
 * rather than capturing `tick` at call time. This guarantees the callback is
 * always a defined function — never undefined — when auto-start fires after a
 * session completes.
 *
 * Ticks are driven manually by capturing the callback from timerService.start,
 * keeping tests fully synchronous and deterministic without fake timers.
 */
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';
import { timerService } from '../services/TimerService';
import type { Settings } from '../types';
import type { TimerWorkerEvent } from '../types/timerWorker';

vi.mock('../services/TimerService', () => ({
    timerService: {
        start: vi.fn(),
        stop: vi.fn(),
        isRunning: vi.fn().mockReturnValue(false),
    },
}));

vi.mock('../utils/sound', () => ({ playBeep: vi.fn() }));

class MockWorker {
    static lastInstance: MockWorker | null = null;
    onmessage: ((event: MessageEvent<TimerWorkerEvent>) => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();

    constructor() {
        MockWorker.lastInstance = this;
    }
}

class MockNotification {
    static permission: NotificationPermission = 'granted';
    static requestPermission = vi.fn<() => Promise<NotificationPermission>>(
        async () => 'granted',
    );

    constructor(_title: string, _options?: NotificationOptions) {}
}

// 1-minute sessions → exactly 60 ticks to reach zero; fast to drive manually.
const FAST_SETTINGS: Settings = {
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakDuration: 1,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: false,
};

/**
 * Drive a captured tick callback `count` times inside a single act so that
 * React flushes all batched state updates once the loop finishes.
 * The tick implementation reads/writes secondsLeftRef synchronously, so the
 * loop correctly traverses all seconds down to zero even inside one act call.
 */
function driveTicksToCompletion(capturedTick: () => void, count: number): void {
    act(() => {
        for (let i = 0; i < count; i++) {
            capturedTick();
        }
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(timerService.isRunning).mockReturnValue(false);
    MockWorker.lastInstance = null;
    vi.stubGlobal('Worker', MockWorker as unknown as typeof Worker);
    vi.stubGlobal(
        'Notification',
        MockNotification as unknown as typeof Notification,
    );
});

describe('useTimer — auto-start closure regression', () => {
    it('timerService.start receives a defined function callback on the initial start() call', () => {
        vi.stubGlobal('Worker', undefined as unknown as typeof Worker);

        const { result } = renderHook(() =>
            useTimer({ settings: FAST_SETTINGS }),
        );

        act(() => {
            result.current.start();
        });

        expect(timerService.start).toHaveBeenCalledTimes(1);

        const cb = vi.mocked(timerService.start).mock.calls[0][0];
        expect(typeof cb).toBe('function');
        expect(cb).not.toBeNull();
        expect(cb).not.toBeUndefined();
    });

    it('when autoStartBreaks is true and a work session completes, timerService.start receives a valid function for the break', () => {
        vi.stubGlobal('Worker', undefined as unknown as typeof Worker);

        const settings: Settings = { ...FAST_SETTINGS, autoStartBreaks: true };
        const { result } = renderHook(() => useTimer({ settings }));

        act(() => {
            result.current.start();
        });

        // Capture tick and note seconds remaining before any ticks run.
        const tick = vi.mocked(timerService.start).mock.calls[0][0];
        expect(typeof tick).toBe('function');

        const initialSeconds = result.current.secondsLeft; // 60 with FAST_SETTINGS

        // Drive every tick; zero-crossing triggers advanceMode(true) → auto-start.
        driveTicksToCompletion(tick, initialSeconds);

        // advanceMode(true) must have called timerService.start a second time.
        expect(timerService.start).toHaveBeenCalledTimes(2);

        const autoStartCb = vi.mocked(timerService.start).mock.calls[1][0];
        expect(typeof autoStartCb).toBe('function');
        expect(autoStartCb).not.toBeNull();
        expect(autoStartCb).not.toBeUndefined();
    });

    it('when autoStartPomodoros is true and a break session completes, timerService.start receives a valid function for the next pomodoro', () => {
        vi.stubGlobal('Worker', undefined as unknown as typeof Worker);

        const settings: Settings = {
            ...FAST_SETTINGS,
            autoStartPomodoros: true,
        };
        const { result } = renderHook(() => useTimer({ settings }));

        // Skip to short-break without triggering any auto-start side-effects.
        act(() => {
            result.current.skip();
        });
        expect(result.current.mode).toBe('short-break');

        // Start the break session; isRunning() returns false from the mock.
        act(() => {
            result.current.start();
        });

        const tick = vi.mocked(timerService.start).mock.calls[0][0];
        expect(typeof tick).toBe('function');

        const initialSeconds = result.current.secondsLeft; // 60 for short-break

        // Drive all break ticks; completing a break with autoStartPomodoros=true
        // must call timerService.start again with a valid wrapper function.
        driveTicksToCompletion(tick, initialSeconds);

        expect(timerService.start).toHaveBeenCalledTimes(2);

        const autoStartCb = vi.mocked(timerService.start).mock.calls[1][0];
        expect(typeof autoStartCb).toBe('function');
        expect(autoStartCb).not.toBeNull();
        expect(autoStartCb).not.toBeUndefined();
    });

    it('handles worker complete event and advances mode', () => {
        const onComplete = vi.fn();
        const { result } = renderHook(() =>
            useTimer({ settings: FAST_SETTINGS, onComplete }),
        );

        act(() => {
            result.current.start();
        });

        const worker = MockWorker.lastInstance;
        expect(worker).not.toBeNull();

        act(() => {
            worker?.onmessage?.({
                data: { type: 'complete' },
            } as MessageEvent<TimerWorkerEvent>);
        });

        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith('work');
        expect(result.current.mode).toBe('short-break');
        expect(result.current.isRunning).toBe(false);
    });
});
