import type { Warning } from '@threeforged/core';
import type { StaticMergeGroup, StaticOptimizerConfig } from '../types.js';

/**
 * Check if merged groups would exceed vertex limits.
 *
 * WebGL 1 (and Three.js by default) uses 16-bit index buffers, supporting
 * a maximum of 65,535 vertices per geometry. Merged groups exceeding this
 * limit would need 32-bit indices or must be split into sub-batches.
 *
 * This rule flags groups that exceed the configured vertex limit so
 * developers know they'll need to handle the split.
 */
export function checkVertexBudget(
  groups: StaticMergeGroup[],
  config: StaticOptimizerConfig,
): Warning[] {
  const warnings: Warning[] = [];

  for (const group of groups) {
    if (group.totalVertices > config.maxMergedVertices) {
      group.exceedsIndexLimit = true;
      group.warnings.push(
        `Merged vertex count (${group.totalVertices.toLocaleString()}) exceeds ` +
          `${config.maxMergedVertices.toLocaleString()}-vertex limit. ` +
          `Use 32-bit indices or split into sub-batches.`,
      );
      warnings.push({
        rule: 'vertex-budget',
        severity: 'warn',
        message:
          `${group.groupId} (${group.materialName}): merged vertex count ` +
          `${group.totalVertices.toLocaleString()} exceeds ${config.maxMergedVertices.toLocaleString()} limit. ` +
          `Requires 32-bit index buffers or sub-batching.`,
      });
    }
  }

  return warnings;
}
