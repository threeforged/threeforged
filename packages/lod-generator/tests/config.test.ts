import { describe, it, expect } from 'vitest';
import { validateConfig, DEFAULT_LOD_CONFIG } from '../src/config.js';
import type { LODGeneratorConfig } from '../src/types.js';

function makeConfig(overrides: Partial<LODGeneratorConfig> = {}): LODGeneratorConfig {
  return { ...DEFAULT_LOD_CONFIG, ...overrides };
}

describe('validateConfig', () => {
  it('should accept valid default config', () => {
    const result = validateConfig(DEFAULT_LOD_CONFIG);
    expect(result.levels).toBe(3);
    expect(result.ratio).toBe(0.5);
    expect(result.error).toBe(0.01);
    expect(result.minTriangles).toBe(8);
    expect(result.maxFiles).toBe(500);
    expect(result.write).toBe(false);
    expect(result.force).toBe(false);
  });

  it('should accept custom valid config', () => {
    const result = validateConfig(
      makeConfig({
        levels: 5,
        ratio: 0.3,
        error: 0.05,
        minTriangles: 100,
        maxFiles: 1000,
      }),
    );
    expect(result.levels).toBe(5);
    expect(result.ratio).toBe(0.3);
    expect(result.error).toBe(0.05);
    expect(result.minTriangles).toBe(100);
  });

  it('should reject non-integer levels', () => {
    expect(() => validateConfig(makeConfig({ levels: 2.5 }))).toThrow(
      'levels must be a positive integer',
    );
  });

  it('should reject zero levels', () => {
    expect(() => validateConfig(makeConfig({ levels: 0 }))).toThrow(
      'levels must be a positive integer',
    );
  });

  it('should reject negative levels', () => {
    expect(() => validateConfig(makeConfig({ levels: -1 }))).toThrow(
      'levels must be a positive integer',
    );
  });

  it('should reject levels > 10', () => {
    expect(() => validateConfig(makeConfig({ levels: 11 }))).toThrow(
      'levels must be at most 10',
    );
  });

  it('should accept levels = 10', () => {
    const result = validateConfig(makeConfig({ levels: 10 }));
    expect(result.levels).toBe(10);
  });

  it('should reject ratio of 0', () => {
    expect(() => validateConfig(makeConfig({ ratio: 0 }))).toThrow(
      'ratio must be a finite number in (0, 1)',
    );
  });

  it('should reject ratio of 1', () => {
    expect(() => validateConfig(makeConfig({ ratio: 1 }))).toThrow(
      'ratio must be a finite number in (0, 1)',
    );
  });

  it('should reject ratio > 1', () => {
    expect(() => validateConfig(makeConfig({ ratio: 1.5 }))).toThrow(
      'ratio must be a finite number in (0, 1)',
    );
  });

  it('should reject negative ratio', () => {
    expect(() => validateConfig(makeConfig({ ratio: -0.5 }))).toThrow(
      'ratio must be a finite number in (0, 1)',
    );
  });

  it('should reject NaN error', () => {
    expect(() => validateConfig(makeConfig({ error: NaN }))).toThrow(
      'error must be a finite positive number',
    );
  });

  it('should reject Infinity error', () => {
    expect(() => validateConfig(makeConfig({ error: Infinity }))).toThrow(
      'error must be a finite positive number',
    );
  });

  it('should reject non-integer minTriangles', () => {
    expect(() => validateConfig(makeConfig({ minTriangles: 5.5 }))).toThrow(
      'minTriangles must be a positive integer',
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

  it('should not mutate original config when capping maxFiles', () => {
    const original = makeConfig({ maxFiles: 50_000 });
    const result = validateConfig(original);
    expect(result.maxFiles).toBe(10_000);
    expect(original.maxFiles).toBe(50_000);
  });

  it('should preserve write and force flags', () => {
    const result = validateConfig(makeConfig({ write: true, force: true }));
    expect(result.write).toBe(true);
    expect(result.force).toBe(true);
  });

  it('should preserve outputDir', () => {
    const result = validateConfig(makeConfig({ outputDir: './output' }));
    expect(result.outputDir).toBe('./output');
  });

  it('should accept valid target', () => {
    const result = validateConfig(makeConfig({ target: 0.3 }));
    expect(result.target).toBe(0.3);
  });

  it('should accept undefined target', () => {
    const result = validateConfig(makeConfig());
    expect(result.target).toBeUndefined();
  });

  it('should reject target of 0', () => {
    expect(() => validateConfig(makeConfig({ target: 0 }))).toThrow(
      'target must be a finite number in (0, 1)',
    );
  });

  it('should reject target of 1', () => {
    expect(() => validateConfig(makeConfig({ target: 1 }))).toThrow(
      'target must be a finite number in (0, 1)',
    );
  });

  it('should reject negative target', () => {
    expect(() => validateConfig(makeConfig({ target: -0.5 }))).toThrow(
      'target must be a finite number in (0, 1)',
    );
  });

  it('should reject NaN target', () => {
    expect(() => validateConfig(makeConfig({ target: NaN }))).toThrow(
      'target must be a finite number in (0, 1)',
    );
  });
});
