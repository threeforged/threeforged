import { loadConfig } from '@threeforged/core';
import type { PerformanceAuditorConfig, PerformanceProfile } from './types.js';

export const DEFAULT_AUDITOR_CONFIG: PerformanceAuditorConfig = {
  profile: 'desktop',
  drawCallThresholds: { mobile: 100, desktop: 300, 'high-end': 1000 },
  triangleThresholds: { mobile: 500_000, desktop: 2_000_000, 'high-end': 10_000_000 },
  vramBudgetMB: { mobile: 128, desktop: 512, 'high-end': 2048 },
  maxMaterials: 20,
  maxMaterialsError: 50,
  maxVerticesPerMesh: 500_000,
  instancingMinCount: 3,
  maxFiles: 500,
};

const VALID_PROFILES: PerformanceProfile[] = ['mobile', 'desktop', 'high-end'];

function isFinitePositive(n: unknown): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function validateConfig(config: PerformanceAuditorConfig): PerformanceAuditorConfig {
  if (!VALID_PROFILES.includes(config.profile)) {
    throw new Error(`Invalid profile "${config.profile}". Must be one of: ${VALID_PROFILES.join(', ')}`);
  }

  for (const profile of VALID_PROFILES) {
    if (!isFinitePositive(config.drawCallThresholds[profile])) {
      throw new Error(`drawCallThresholds.${profile} must be a finite positive number`);
    }
    if (!isFinitePositive(config.triangleThresholds[profile])) {
      throw new Error(`triangleThresholds.${profile} must be a finite positive number`);
    }
    if (!isFinitePositive(config.vramBudgetMB[profile])) {
      throw new Error(`vramBudgetMB.${profile} must be a finite positive number`);
    }
  }

  if (!isFinitePositive(config.maxMaterials)) {
    throw new Error('maxMaterials must be a finite positive number');
  }
  if (!isFinitePositive(config.maxMaterialsError)) {
    throw new Error('maxMaterialsError must be a finite positive number');
  }
  if (!isFinitePositive(config.maxVerticesPerMesh)) {
    throw new Error('maxVerticesPerMesh must be a finite positive number');
  }
  if (!isFinitePositive(config.instancingMinCount)) {
    throw new Error('instancingMinCount must be a finite positive number');
  }
  if (!isFinitePositive(config.maxFiles)) {
    throw new Error('maxFiles must be a finite positive number');
  }

  if (config.maxFiles > 10_000) {
    config = { ...config, maxFiles: 10_000 };
  }

  return config;
}

export async function loadAuditorConfig(
  profile?: PerformanceProfile,
): Promise<PerformanceAuditorConfig> {
  const coreConfig = await loadConfig();
  const userConfig = (coreConfig as unknown as Record<string, unknown>).performanceAuditor as
    | Partial<PerformanceAuditorConfig>
    | undefined;

  const merged: PerformanceAuditorConfig = {
    ...DEFAULT_AUDITOR_CONFIG,
    ...userConfig,
    drawCallThresholds: {
      ...DEFAULT_AUDITOR_CONFIG.drawCallThresholds,
      ...userConfig?.drawCallThresholds,
    },
    triangleThresholds: {
      ...DEFAULT_AUDITOR_CONFIG.triangleThresholds,
      ...userConfig?.triangleThresholds,
    },
    vramBudgetMB: {
      ...DEFAULT_AUDITOR_CONFIG.vramBudgetMB,
      ...userConfig?.vramBudgetMB,
    },
  };

  if (profile) {
    merged.profile = profile;
  }

  return validateConfig(merged);
}
