import type { ParsedDocument, Warning } from '@threeforged/core';
import type { StaticMergeGroup, StaticOptimizerConfig } from '../types.js';
import { groupByMaterial } from './material-grouping.js';
import { excludeAnimatedMeshes } from './animation-exclusion.js';
import { checkAttributeCompatibility } from './attribute-compatibility.js';
import { estimateSavings } from './savings-estimation.js';
import { checkVertexBudget } from './vertex-budget.js';

export interface RulesResult {
  groups: StaticMergeGroup[];
  warnings: Warning[];
  animatedMeshCount: number;
}

export function runAllRules(
  documents: ParsedDocument[],
  config: StaticOptimizerConfig,
): RulesResult {
  const warnings: Warning[] = [];

  // 1. Group meshes by material compatibility
  const { groups } = groupByMaterial(documents, config);

  // 2. Check for animated meshes and add warnings
  const animationResult = excludeAnimatedMeshes(groups, documents);
  warnings.push(...animationResult.warnings);

  // 3. Check vertex attribute compatibility within groups
  warnings.push(...checkAttributeCompatibility(groups, documents));

  // 4. Estimate draw call savings
  const totalDrawCalls = documents.reduce((sum, doc) => sum + doc.drawCalls, 0);
  warnings.push(...estimateSavings(groups, totalDrawCalls));

  // 5. Check vertex budget limits
  warnings.push(...checkVertexBudget(groups, config));

  return {
    groups,
    warnings,
    animatedMeshCount: animationResult.animatedMeshCount,
  };
}
