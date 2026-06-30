import { describe, expect, it } from 'vitest';
import { hexToHSL, hexToRgb } from './color';

describe('hexToRgb', () => {
  it('converts black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts primary colors', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts the default accent color', () => {
    expect(hexToRgb('#6366f1')).toEqual({ r: 99, g: 102, b: 241 });
  });

  it('handles hex without hash prefix', () => {
    expect(hexToRgb('6366f1')).toEqual({ r: 99, g: 102, b: 241 });
  });

  it('is case-insensitive', () => {
    expect(hexToRgb('#FF00AA')).toEqual({ r: 255, g: 0, b: 170 });
    expect(hexToRgb('#ff00aa')).toEqual({ r: 255, g: 0, b: 170 });
  });

  it('returns null for invalid input', () => {
    expect(hexToRgb('')).toBeNull();
    expect(hexToRgb('#xyz')).toBeNull();
    expect(hexToRgb('#ff00')).toBeNull();
  });
});

describe('hexToHSL', () => {
  it('converts black', () => {
    const result = hexToHSL('#000000');
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(0);
  });

  it('converts white', () => {
    const result = hexToHSL('#ffffff');
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(100);
  });

  it('converts pure red', () => {
    const result = hexToHSL('#ff0000');
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('converts pure green', () => {
    const result = hexToHSL('#00ff00');
    expect(result.h).toBe(120);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('converts pure blue', () => {
    const result = hexToHSL('#0000ff');
    expect(result.h).toBe(240);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('converts 50% gray', () => {
    const result = hexToHSL('#808080');
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(50.2, 0);
  });

  it('converts the default accent color', () => {
    const result = hexToHSL('#6366f1');
    expect(result.h).toBeCloseTo(239, 0);
    expect(result.s).toBeCloseTo(84, 0);
    expect(result.l).toBeCloseTo(66.7, 0);
  });
});
