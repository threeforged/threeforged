import type { ParsedDocument, Warning } from '@threeforged/core';
import type { InstancingCandidate, InstancingOptimizerConfig } from '../types.js';
import { groupByGeometry } from './geometry-grouping.js';
import { adjustForAnimations } from './animation-exclusion.js';
import { adjustForMaterials } from './material-compatibility.js';
import { estimateSavings } from './savings-estimation.js';
import { detectCrossFileOpportunities } from './cross-file-detection.js';

export interface RulesResult {
  candidates: InstancingCandidate[];
  warnings: Warning[];
}

export function runAllRules(
  documents: ParsedDocument[],
  config: InstancingOptimizerConfig,
): RulesResult {
  const warnings: Warning[] = [];

  // 1. Group meshes by geometry signature
  const candidates = groupByGeometry(documents, config);

  // 2. Adjust confidence for animations
  warnings.push(...adjustForAnimations(candidates, documents));

  // 3. Adjust confidence for material compatibility
  warnings.push(...adjustForMaterials(candidates, documents, config));

  // 4. Estimate savings
  const totalDrawCalls = documents.reduce((sum, doc) => sum + doc.drawCalls, 0);
  warnings.push(...estimateSavings(candidates, totalDrawCalls));

  // 5. Detect cross-file opportunities
  warnings.push(...detectCrossFileOpportunities(candidates));

  return { candidates, warnings };
}
