import { describe, expect, it } from 'vitest';
import { getPositionStyles } from './position';

describe('getPositionStyles', () => {
  it('returns top-right for default/unknown values', () => {
    expect(getPositionStyles('top-right')).toEqual({ top: 24, right: 24 });
    expect(getPositionStyles('unknown')).toEqual({ top: 24, right: 24 });
    expect(getPositionStyles('')).toEqual({ top: 24, right: 24 });
  });

  it('returns top-left position', () => {
    expect(getPositionStyles('top-left')).toEqual({ top: 24, left: 24 });
  });

  it('returns top-center position with transform', () => {
    expect(getPositionStyles('top-center')).toEqual({
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
    });
  });

  it('returns bottom-left position', () => {
    expect(getPositionStyles('bottom-left')).toEqual({ bottom: 24, left: 24 });
  });

  it('returns bottom-right position', () => {
    expect(getPositionStyles('bottom-right')).toEqual({ bottom: 24, right: 24 });
  });

  it('returns bottom-center position with transform', () => {
    expect(getPositionStyles('bottom-center')).toEqual({
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
    });
  });
});
