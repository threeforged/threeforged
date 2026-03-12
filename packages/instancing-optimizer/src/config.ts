import { loadConfig } from '@threeforged/core';
import type { InstancingOptimizerConfig } from './types.js';

export const DEFAULT_OPTIMIZER_CONFIG: InstancingOptimizerConfig = {
  instancingMinCount: 3,
  maxGroups: 20,
  maxEntriesPerGroup: 8,
  minTrianglesPerMesh: 10,
  maxFiles: 500,
  materialHeterogeneityThreshold: 0.5,
};

function isFinitePositive(n: unknown): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function validateConfig(config: InstancingOptimizerConfig): InstancingOptimizerConfig {
  if (!isFinitePositive(config.instancingMinCount)) {
    throw new Error('instancingMinCount must be a finite positive number');
  }
  if (!isFinitePositive(config.maxGroups)) {
    throw new Error('maxGroups must be a finite positive number');
  }
  if (!isFinitePositive(config.maxEntriesPerGroup)) {
    throw new Error('maxEntriesPerGroup must be a finite positive number');
  }
  if (!isFinitePositive(config.minTrianglesPerMesh)) {
    throw new Error('minTrianglesPerMesh must be a finite positive number');
  }
  if (!isFinitePositive(config.maxFiles)) {
    throw new Error('maxFiles must be a finite positive number');
  }
  if (
    !isFinitePositive(config.materialHeterogeneityThreshold) ||
    config.materialHeterogeneityThreshold > 1
  ) {
    throw new Error('materialHeterogeneityThreshold must be a finite positive number in (0, 1]');
  }

  if (config.maxFiles > 10_000) {
    config = { ...config, maxFiles: 10_000 };
  }

  return config;
}

export async function loadOptimizerConfig(): Promise<InstancingOptimizerConfig> {
  const coreConfig = await loadConfig();
  const userConfig = (coreConfig as unknown as Record<string, unknown>).instancingOptimizer as
    | Partial<InstancingOptimizerConfig>
    | undefined;

  const merged: InstancingOptimizerConfig = {
    ...DEFAULT_OPTIMIZER_CONFIG,
    ...userConfig,
  };

  return validateConfig(merged);
}
