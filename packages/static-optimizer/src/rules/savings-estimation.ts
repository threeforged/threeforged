import type { Warning } from '@threeforged/core';
import type { StaticMergeGroup } from '../types.js';

/**
 * Estimate draw call savings from static batching.
 *
 * When N meshes sharing a material are merged into 1, draw calls reduce by N-1.
 * Unlike instancing, static batching does NOT save VRAM — it actually increases
 * it slightly because the merged buffer may include padding/alignment overhead.
 * We estimate this overhead conservatively.
 */

// Small overhead per merge for buffer alignment/metadata
const MERGE_OVERHEAD_BYTES = 256;

export function estimateSavings(
  groups: StaticMergeGroup[],
  totalDrawCalls: number,
): Warning[] {
  const warnings: Warning[] = [];

  let totalDrawCallsSaved = 0;

  for (const group of groups) {
    // Merging N meshes into 1 saves N-1 draw calls
    group.drawCallsSaved = group.meshCount - 1;
    totalDrawCallsSaved += group.drawCallsSaved;

    // VRAM overhead: the merged buffer stores all vertices in one buffer,
    // but we lose the ability to share geometry. Estimate overhead per merge.
    const overheadBytes = MERGE_OVERHEAD_BYTES;
    group.vramOverheadBytes = Number.isFinite(overheadBytes) && overheadBytes >= 0
      ? overheadBytes
      : 0;
  }

  if (totalDrawCalls > 0) {
    const reductionPercent = (totalDrawCallsSaved / totalDrawCalls) * 100;

    if (reductionPercent >= 50) {
      warnings.push({
        rule: 'savings-estimation',
        severity: 'error',
        message:
          `Static batching could reduce draw calls by ${reductionPercent.toFixed(1)}% ` +
          `(${totalDrawCallsSaved}/${totalDrawCalls}). This scene has severe draw call overhead from unbatched static meshes.`,
      });
    } else if (reductionPercent >= 20) {
      warnings.push({
        rule: 'savings-estimation',
        severity: 'warn',
        message:
          `Static batching could reduce draw calls by ${reductionPercent.toFixed(1)}% ` +
          `(${totalDrawCallsSaved}/${totalDrawCalls}). Consider merging static meshes that share materials.`,
      });
    } else if (reductionPercent >= 5) {
      warnings.push({
        rule: 'savings-estimation',
        severity: 'info',
        message:
          `Static batching could reduce draw calls by ${reductionPercent.toFixed(1)}% ` +
          `(${totalDrawCallsSaved}/${totalDrawCalls}).`,
      });
    }
  }

  return warnings;
}
