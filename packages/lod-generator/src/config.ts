import { loadConfig } from '@threeforged/core';
import type { LODGeneratorConfig } from './types.js';

export const DEFAULT_LOD_CONFIG: LODGeneratorConfig = {
  levels: 3,
  ratio: 0.5,
  error: 0.01,
  minTriangles: 8,
  maxFiles: 500,
  write: false,
  force: false,
};

function isFinitePositive(n: unknown): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function validateConfig(config: LODGeneratorConfig): LODGeneratorConfig {
  if (!isFinitePositive(config.levels) || !Number.isInteger(config.levels)) {
    throw new Error('levels must be a positive integer');
  }
  if (config.levels > 10) {
    throw new Error('levels must be at most 10');
  }
  if (!isFinitePositive(config.ratio) || config.ratio >= 1) {
    throw new Error('ratio must be a finite number in (0, 1)');
  }
  if (!isFinitePositive(config.error)) {
    throw new Error('error must be a finite positive number');
  }
  if (!isFinitePositive(config.minTriangles) || !Number.isInteger(config.minTriangles)) {
    throw new Error('minTriangles must be a positive integer');
  }
  if (!isFinitePositive(config.maxFiles)) {
    throw new Error('maxFiles must be a finite positive number');
  }

  if (config.target !== undefined) {
    if (typeof config.target !== 'number' || !Number.isFinite(config.target) || config.target <= 0 || config.target >= 1) {
      throw new Error('target must be a finite number in (0, 1)');
    }
  }

  let result = config;
  if (result.maxFiles > 10_000) {
    result = { ...result, maxFiles: 10_000 };
  }

  return result;
}

export async function loadLODConfig(
  overrides?: Partial<LODGeneratorConfig>,
): Promise<LODGeneratorConfig> {
  const coreConfig = await loadConfig();
  const userConfig = (coreConfig as unknown as Record<string, unknown>).lodGenerator as
    | Partial<LODGeneratorConfig>
    | undefined;

  const merged: LODGeneratorConfig = {
    ...DEFAULT_LOD_CONFIG,
    ...userConfig,
    ...overrides,
  };

  return validateConfig(merged);
}
