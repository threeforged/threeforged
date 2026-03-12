export { generateLOD } from './generator.js';
export { threeforgedPlugin } from './plugin.js';
export { DEFAULT_LOD_CONFIG, validateConfig, loadLODConfig } from './config.js';
export type {
  LODMeshLevel,
  LODLevel,
  LODFileResult,
  LODMetrics,
  LODReport,
  LODGeneratorConfig,
} from './types.js';
export type { ParsedDocument, Warning } from '@threeforged/core';
