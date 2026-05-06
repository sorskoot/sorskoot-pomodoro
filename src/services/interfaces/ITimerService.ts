export type TimerCallback = () => void;

export interface ITimerService {
  start(onTick: TimerCallback): void;
  stop(): void;
  isRunning(): boolean;
}
