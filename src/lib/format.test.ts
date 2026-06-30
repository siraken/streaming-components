import { describe, expect, it } from 'vitest';
import { formatTime, pad } from './format';

describe('pad', () => {
  it('pads single digit with leading zero', () => {
    expect(pad(0)).toBe('00');
    expect(pad(5)).toBe('05');
    expect(pad(9)).toBe('09');
  });

  it('keeps double digits as-is', () => {
    expect(pad(10)).toBe('10');
    expect(pad(23)).toBe('23');
    expect(pad(59)).toBe('59');
  });

  it('handles numbers larger than 99', () => {
    expect(pad(100)).toBe('100');
    expect(pad(999)).toBe('999');
  });
});

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(30)).toBe('00:30');
    expect(formatTime(59)).toBe('00:59');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(305)).toBe('05:05');
  });

  it('formats large values', () => {
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(5999)).toBe('99:59');
  });
});
