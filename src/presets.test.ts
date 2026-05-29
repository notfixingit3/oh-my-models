import { describe, test, expect } from 'bun:test'
import { getPreset } from './presets'

describe('presets', () => {
  test('getPreset returns known presets case-insensitively', () => {
    expect(getPreset('mixed')).not.toBeNull()
    expect(getPreset('MIXED')).not.toBeNull()
    expect(getPreset('mix')).not.toBeNull()
    expect(getPreset('claude')).not.toBeNull()
    expect(getPreset('fast')).not.toBeNull()
  })

  test('unknown preset returns null', () => {
    expect(getPreset('nonexistent-preset-xyz')).toBeNull()
  })
})
