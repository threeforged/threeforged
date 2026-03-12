import { describe, it, expect } from 'vitest';
import { validateConfig, DEFAULT_AUDITOR_CONFIG } from '../src/config.js';
import type { PerformanceAuditorConfig } from '../src/types.js';

function makeConfig(overrides: Partial<PerformanceAuditorConfig> = {}): PerformanceAuditorConfig {
  return { ...DEFAULT_AUDITOR_CONFIG, ...overrides };
}

describe('validateConfig', () => {
  it('should accept valid default config', () => {
    const result = validateConfig(DEFAULT_AUDITOR_CONFIG);
    expect(result.profile).toBe('desktop');
  });

  it('should accept all valid profiles', () => {
    expect(validateConfig(makeConfig({ profile: 'mobile' })).profile).toBe('mobile');
    expect(validateConfig(makeConfig({ profile: 'desktop' })).profile).toBe('desktop');
    expect(validateConfig(makeConfig({ profile: 'high-end' })).profile).toBe('high-end');
  });

  it('should reject invalid profile', () => {
    expect(() => validateConfig(makeConfig({ profile: 'ultra' as never }))).toThrow('Invalid profile');
  });

  it('should reject negative thresholds', () => {
    expect(() =>
      validateConfig(makeConfig({ maxMaterials: -1 })),
    ).toThrow('maxMaterials must be a finite positive number');
  });

  it('should reject NaN thresholds', () => {
    expect(() =>
      validateConfig(makeConfig({ maxVerticesPerMesh: NaN })),
    ).toThrow('maxVerticesPerMesh must be a finite positive number');
  });

  it('should reject Infinity thresholds', () => {
    expect(() =>
      validateConfig(makeConfig({ instancingMinCount: Infinity })),
    ).toThrow('instancingMinCount must be a finite positive number');
  });

  it('should reject zero values', () => {
    expect(() =>
      validateConfig(makeConfig({ maxFiles: 0 })),
    ).toThrow('maxFiles must be a finite positive number');
  });

  it('should cap maxFiles at 10,000', () => {
    const result = validateConfig(makeConfig({ maxFiles: 50_000 }));
    expect(result.maxFiles).toBe(10_000);
  });

  it('should reject invalid drawCallThresholds', () => {
    expect(() =>
      validateConfig(makeConfig({
        drawCallThresholds: { mobile: -1, desktop: 300, 'high-end': 1000 },
      })),
    ).toThrow('drawCallThresholds.mobile must be a finite positive number');
  });
});
