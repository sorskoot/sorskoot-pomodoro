/// <reference lib="webworker" />

import type {
    TimerWorkerCommand,
    TimerWorkerEvent,
} from '../types/timerWorker';

let intervalId: number | null = null;
let endAtMs = 0;

function stopInterval(): void {
    if (intervalId !== null) {
        self.clearInterval(intervalId);
        intervalId = null;
    }
}

function emit(message: TimerWorkerEvent): void {
    self.postMessage(message);
}

function computeSecondsLeft(nowMs: number): number {
    return Math.max(0, Math.ceil((endAtMs - nowMs) / 1000));
}

function startLoop(): void {
    stopInterval();

    intervalId = self.setInterval(() => {
        const secondsLeft = computeSecondsLeft(Date.now());
        emit({ type: 'tick', secondsLeft });

        if (secondsLeft <= 0) {
            stopInterval();
            emit({ type: 'complete' });
        }
    }, 250);
}

self.onmessage = (event: MessageEvent<TimerWorkerCommand>) => {
    const message = event.data;

    if (message.type === 'start' || message.type === 'sync') {
        endAtMs = message.endAt;
        startLoop();
        return;
    }

    if (message.type === 'pause' || message.type === 'stop') {
        stopInterval();
    }
};
