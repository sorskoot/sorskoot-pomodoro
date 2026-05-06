import { TimerService } from './TimerService';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new TimerService();
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it('isRunning() is false initially', () => {
    expect(service.isRunning()).toBe(false);
  });

  it('isRunning() is true after start()', () => {
    service.start(vi.fn());
    expect(service.isRunning()).toBe(true);
  });

  it('calls onTick once per second', () => {
    const onTick = vi.fn();
    service.start(onTick);

    vi.advanceTimersByTime(3000);

    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it('stop() halts ticks and isRunning() returns false', () => {
    const onTick = vi.fn();
    service.start(onTick);

    vi.advanceTimersByTime(2000);
    service.stop();
    vi.advanceTimersByTime(3000);

    expect(onTick).toHaveBeenCalledTimes(2);
    expect(service.isRunning()).toBe(false);
  });

  it('calling start() twice sets up only one interval (onTick fires once per second, not twice)', () => {
    const onTick = vi.fn();
    service.start(onTick);
    service.start(onTick); // second call should be a no-op

    vi.advanceTimersByTime(3000);

    expect(onTick).toHaveBeenCalledTimes(3);
  });
});
