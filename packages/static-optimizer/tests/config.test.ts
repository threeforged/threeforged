import { describe, it, expect } from 'vitest';
import { validateConfig, DEFAULT_STATIC_CONFIG } from '../src/config.js';
import type { StaticOptimizerConfig } from '../src/types.js';

function makeConfig(overrides: Partial<StaticOptimizerConfig> = {}): StaticOptimizerConfig {
  return { ...DEFAULT_STATIC_CONFIG, ...overrides };
}

describe('validateConfig', () => {
  it('should accept valid default config', () => {
    const result = validateConfig(DEFAULT_STATIC_CONFIG);
    expect(result.minMeshesPerGroup).toBe(2);
    expect(result.maxMergedVertices).toBe(65535);
  });

  it('should accept custom valid config', () => {
    const result = validateConfig(
      makeConfig({
        minMeshesPerGroup: 3,
        maxGroups: 10,
        maxEntriesPerGroup: 4,
        maxFiles: 1000,
        maxMergedVertices: 100000,
      }),
    );
    expect(result.minMeshesPerGroup).toBe(3);
    expect(result.maxGroups).toBe(10);
    expect(result.maxMergedVertices).toBe(100000);
  });

  it('should reject negative minMeshesPerGroup', () => {
    expect(() => validateConfig(makeConfig({ minMeshesPerGroup: -1 }))).toThrow(
      'minMeshesPerGroup must be a finite positive number',
    );
  });

  it('should reject zero minMeshesPerGroup', () => {
    expect(() => validateConfig(makeConfig({ minMeshesPerGroup: 0 }))).toThrow(
      'minMeshesPerGroup must be a finite positive number',
    );
  });

  it('should reject zero maxGroups', () => {
    expect(() => validateConfig(makeConfig({ maxGroups: 0 }))).toThrow(
      'maxGroups must be a finite positive number',
    );
  });

  it('should reject NaN maxEntriesPerGroup', () => {
    expect(() => validateConfig(makeConfig({ maxEntriesPerGroup: NaN }))).toThrow(
      'maxEntriesPerGroup must be a finite positive number',
    );
  });

  it('should reject Infinity maxFiles', () => {
    expect(() => validateConfig(makeConfig({ maxFiles: Infinity }))).toThrow(
      'maxFiles must be a finite positive number',
    );
  });

  it('should reject zero maxMergedVertices', () => {
    expect(() => validateConfig(makeConfig({ maxMergedVertices: 0 }))).toThrow(
      'maxMergedVertices must be a finite positive number',
    );
  });

  it('should reject NaN maxMergedVertices', () => {
    expect(() => validateConfig(makeConfig({ maxMergedVertices: NaN }))).toThrow(
      'maxMergedVertices must be a finite positive number',
    );
  });

  it('should cap maxFiles at 10,000', () => {
    const result = validateConfig(makeConfig({ maxFiles: 50_000 }));
    expect(result.maxFiles).toBe(10_000);
  });

  it('should not mutate original config when capping maxFiles', () => {
    const original = makeConfig({ maxFiles: 50_000 });
    const result = validateConfig(original);
    expect(result.maxFiles).toBe(10_000);
    expect(original.maxFiles).toBe(50_000);
  });

  it('should preserve all fields when maxFiles is below cap', () => {
    const result = validateConfig(makeConfig({ maxFiles: 200 }));
    expect(result.maxFiles).toBe(200);
    expect(result.minMeshesPerGroup).toBe(DEFAULT_STATIC_CONFIG.minMeshesPerGroup);
  });
});
