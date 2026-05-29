import { describe, test, expect } from 'bun:test';
import { colors, type ColorName } from './colors';

describe('colors', () => {
  test('exports all expected color helpers', () => {
    const expectedColors: ColorName[] = [
      'primary',
      'success',
      'warning',
      'error',
      'muted',
      'bold',
      'dim',
      'model',
      'agent',
      'preset',
      'yellow',
    ];

    for (const name of expectedColors) {
      expect(typeof colors[name]).toBe('function');
    }
  });

  test('does not allow using non-existent colors at the type level', () => {
    // This test is mostly for documentation.
    // If someone writes colors.purple, TypeScript will error at compile time.
    // We just verify the type exists and is usable.
    const name: ColorName = 'success';
    expect(name).toBe('success');
  });

  test('color functions return strings', () => {
    expect(typeof colors.primary('test')).toBe('string');
    expect(typeof colors.yellow('safety')).toBe('string');
  });
});
