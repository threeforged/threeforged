import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig, PerformanceAuditReport } from '../types.js';
import { checkDrawCalls } from './draw-calls.js';
import { checkTriangleBudget } from './triangle-budget.js';
import { checkVramUsage } from './vram-usage.js';
import { checkMaterialCount } from './material-count.js';
import { checkGeometryComplexity } from './geometry-complexity.js';
import { checkInstancingOpportunities } from './instancing-opportunities.js';
import { computePerformanceScore } from './performance-score.js';

export interface RulesResult {
  warnings: Warning[];
  score: number;
  grade: PerformanceAuditReport['grade'];
}

export function runAllRules(
  documents: ParsedDocument[],
  config: PerformanceAuditorConfig,
): RulesResult {
  const warnings: Warning[] = [];

  // Per-document rules
  for (const doc of documents) {
    warnings.push(...checkDrawCalls(doc, config));
    warnings.push(...checkTriangleBudget(doc, config));
    warnings.push(...checkVramUsage(doc, config));
    warnings.push(...checkMaterialCount(doc, config));
    warnings.push(...checkGeometryComplexity(doc, config));
  }

  // Cross-document rules
  warnings.push(...checkInstancingOpportunities(documents, config));

  // Aggregate score
  const { score, grade, warnings: scoreWarnings } = computePerformanceScore(documents, config);
  warnings.push(...scoreWarnings);

  return { warnings, score, grade };
}
