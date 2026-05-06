import type { ITimerService, TimerCallback } from './interfaces/ITimerService';

export class TimerService implements ITimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(onTick: TimerCallback): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(onTick, 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

export const timerService = new TimerService();
