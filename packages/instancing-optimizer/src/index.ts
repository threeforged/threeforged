export { detectInstancingCandidates } from './optimizer.js';
export { threeforgedPlugin } from './plugin.js';
export { DEFAULT_OPTIMIZER_CONFIG, validateConfig, loadOptimizerConfig } from './config.js';
export type {
  InstancingConfidence,
  InstancingMeshEntry,
  InstancingCandidate,
  InstancingMetrics,
  InstancingReport,
  InstancingOptimizerConfig,
} from './types.js';
export type { ParsedDocument, Warning } from '@threeforged/core';
