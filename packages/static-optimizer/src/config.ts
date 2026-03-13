import { loadConfig } from '@threeforged/core';
import type { StaticOptimizerConfig } from './types.js';

export const DEFAULT_STATIC_CONFIG: StaticOptimizerConfig = {
  minMeshesPerGroup: 2,
  maxGroups: 20,
  maxEntriesPerGroup: 8,
  maxFiles: 500,
  maxMergedVertices: 65535,
  write: false,
  force: false,
};

function isFinitePositive(n: unknown): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function validateConfig(config: StaticOptimizerConfig): StaticOptimizerConfig {
  if (!isFinitePositive(config.minMeshesPerGroup)) {
    throw new Error('minMeshesPerGroup must be a finite positive number');
  }
  if (!isFinitePositive(config.maxGroups)) {
    throw new Error('maxGroups must be a finite positive number');
  }
  if (!isFinitePositive(config.maxEntriesPerGroup)) {
    throw new Error('maxEntriesPerGroup must be a finite positive number');
  }
  if (!isFinitePositive(config.maxFiles)) {
    throw new Error('maxFiles must be a finite positive number');
  }
  if (!isFinitePositive(config.maxMergedVertices)) {
    throw new Error('maxMergedVertices must be a finite positive number');
  }

  let result = config;

  if (result.maxFiles > 10_000) {
    result = { ...result, maxFiles: 10_000 };
  }

  return result;
}

export async function loadStaticConfig(
  overrides?: Partial<StaticOptimizerConfig>,
): Promise<StaticOptimizerConfig> {
  const coreConfig = await loadConfig();
  const userConfig = (coreConfig as unknown as Record<string, unknown>).staticOptimizer as
    | Partial<StaticOptimizerConfig>
    | undefined;

  const merged: StaticOptimizerConfig = {
    ...DEFAULT_STATIC_CONFIG,
    ...userConfig,
    ...overrides,
  };

  return validateConfig(merged);
}
