import { describe, it, expect } from 'vitest';
import { validateConfig, DEFAULT_OPTIMIZER_CONFIG } from '../src/config.js';
import type { InstancingOptimizerConfig } from '../src/types.js';

function makeConfig(overrides: Partial<InstancingOptimizerConfig> = {}): InstancingOptimizerConfig {
  return { ...DEFAULT_OPTIMIZER_CONFIG, ...overrides };
}

describe('validateConfig', () => {
  it('should accept valid default config', () => {
    const result = validateConfig(DEFAULT_OPTIMIZER_CONFIG);
    expect(result.instancingMinCount).toBe(3);
  });

  it('should accept custom valid config', () => {
    const result = validateConfig(makeConfig({
      instancingMinCount: 5,
      maxGroups: 10,
      maxEntriesPerGroup: 4,
      minTrianglesPerMesh: 50,
      maxFiles: 1000,
      materialHeterogeneityThreshold: 0.8,
    }));
    expect(result.instancingMinCount).toBe(5);
    expect(result.maxGroups).toBe(10);
    expect(result.materialHeterogeneityThreshold).toBe(0.8);
  });

  it('should reject negative instancingMinCount', () => {
    expect(() => validateConfig(makeConfig({ instancingMinCount: -1 }))).toThrow(
      'instancingMinCount must be a finite positive number',
    );
  });

  it('should reject zero maxGroups', () => {
    expect(() => validateConfig(makeConfig({ maxGroups: 0 }))).toThrow(
      'maxGroups must be a finite positive number',
    );
  });

  it('should reject NaN minTrianglesPerMesh', () => {
    expect(() => validateConfig(makeConfig({ minTrianglesPerMesh: NaN }))).toThrow(
      'minTrianglesPerMesh must be a finite positive number',
    );
  });

  it('should reject Infinity maxEntriesPerGroup', () => {
    expect(() => validateConfig(makeConfig({ maxEntriesPerGroup: Infinity }))).toThrow(
      'maxEntriesPerGroup must be a finite positive number',
    );
  });

  it('should reject zero maxFiles', () => {
    expect(() => validateConfig(makeConfig({ maxFiles: 0 }))).toThrow(
      'maxFiles must be a finite positive number',
    );
  });

  it('should cap maxFiles at 10,000', () => {
    const result = validateConfig(makeConfig({ maxFiles: 50_000 }));
    expect(result.maxFiles).toBe(10_000);
  });

  it('should reject materialHeterogeneityThreshold of 0', () => {
    expect(() =>
      validateConfig(makeConfig({ materialHeterogeneityThreshold: 0 })),
    ).toThrow('materialHeterogeneityThreshold must be a finite positive number in (0, 1]');
  });

  it('should reject materialHeterogeneityThreshold > 1', () => {
    expect(() =>
      validateConfig(makeConfig({ materialHeterogeneityThreshold: 1.5 })),
    ).toThrow('materialHeterogeneityThreshold must be a finite positive number in (0, 1]');
  });

  it('should accept materialHeterogeneityThreshold of exactly 1', () => {
    const result = validateConfig(makeConfig({ materialHeterogeneityThreshold: 1 }));
    expect(result.materialHeterogeneityThreshold).toBe(1);
  });

  it('should not mutate original config when capping maxFiles', () => {
    const original = makeConfig({ maxFiles: 50_000 });
    const result = validateConfig(original);
    expect(result.maxFiles).toBe(10_000);
    expect(original.maxFiles).toBe(50_000);
  });
});
