import { formatTime, isSameDay } from './time';

describe('formatTime', () => {
  it('formats zero as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });
  it('formats 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });
  it('formats 25 minutes correctly', () => {
    expect(formatTime(1500)).toBe('25:00');
  });
  it('clamps negative values to 00:00', () => {
    expect(formatTime(-5)).toBe('00:00');
  });
});

describe('isSameDay', () => {
  it('returns true for same day', () => {
    expect(isSameDay('2024-01-15T12:00:00', '2024-01-15T14:00:00')).toBe(true);
  });
  it('returns false for different days', () => {
    expect(isSameDay('2024-01-15T10:00:00', '2024-01-16T10:00:00')).toBe(false);
  });
});
