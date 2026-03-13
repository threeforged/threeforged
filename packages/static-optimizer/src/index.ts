export { detectStaticMergeCandidates } from './optimizer.js';
export { mergeStaticMeshes, readDocument, writeDocument } from './merge.js';
export type { MergeResult } from './merge.js';
export { threeforgedPlugin } from './plugin.js';
export { DEFAULT_STATIC_CONFIG, validateConfig, loadStaticConfig } from './config.js';
export type {
  StaticMeshEntry,
  StaticMergeGroup,
  StaticFileResult,
  StaticMetrics,
  StaticReport,
  StaticOptimizerConfig,
} from './types.js';
export type { ParsedDocument, Warning } from '@threeforged/core';
