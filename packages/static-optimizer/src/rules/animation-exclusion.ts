import type { ParsedDocument, Warning } from '@threeforged/core';
import type { StaticMergeGroup } from '../types.js';

export interface AnimationExclusionResult {
  animatedMeshCount: number;
  warnings: Warning[];
}

/**
 * Detect animated meshes and add warnings to affected merge groups.
 * Animated meshes should not be statically batched because their transforms
 * change at runtime, making a merged geometry invalid.
 */
export function excludeAnimatedMeshes(
  groups: StaticMergeGroup[],
  documents: ParsedDocument[],
): AnimationExclusionResult {
  const warnings: Warning[] = [];

  const totalChannels = documents.reduce(
    (sum, doc) => sum + doc.animations.reduce((s, a) => s + a.channels, 0),
    0,
  );
  const totalMeshes = documents.reduce((sum, doc) => sum + doc.meshes.length, 0);

  if (totalChannels === 0) {
    return { animatedMeshCount: 0, warnings };
  }

  const ratio = totalMeshes > 0 ? totalChannels / totalMeshes : 0;

  // Estimate how many meshes are animated
  const estimatedAnimated = Math.min(totalChannels, totalMeshes);

  for (const group of groups) {
    if (ratio >= 1) {
      // Most meshes are likely animated — this group is risky
      group.warnings.push(
        `High animation density (${totalChannels} channels / ${totalMeshes} meshes): ` +
          `most meshes are likely animated and should NOT be statically batched`,
      );
    } else if (ratio > 0) {
      group.warnings.push(
        `Scene has animations (${totalChannels} channels / ${totalMeshes} meshes): ` +
          `verify these meshes are truly static before merging`,
      );
    }
  }

  if (ratio >= 1) {
    warnings.push({
      rule: 'animation-exclusion',
      severity: 'warn',
      message:
        `High animation density (${totalChannels} channels / ${totalMeshes} meshes). ` +
        `Animated meshes must not be statically batched — verify all merge candidates are truly static.`,
    });
  } else if (ratio > 0) {
    warnings.push({
      rule: 'animation-exclusion',
      severity: 'info',
      message:
        `Scene contains animations (${totalChannels} channels / ${totalMeshes} meshes). ` +
        `Some merge candidates may be animated — verify before merging.`,
    });
  }

  return { animatedMeshCount: estimatedAnimated, warnings };
}
