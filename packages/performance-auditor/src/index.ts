export { auditPerformance } from './auditor.js';
export { threeforgedPlugin } from './plugin.js';
export { DEFAULT_AUDITOR_CONFIG, validateConfig, loadAuditorConfig } from './config.js';
export type {
  PerformanceProfile,
  PerformanceAuditorConfig,
  PerformanceAuditReport,
} from './types.js';
export type { ParsedDocument, Warning } from '@threeforged/core';
