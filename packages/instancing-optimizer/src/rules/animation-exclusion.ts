import type { ParsedDocument, Warning } from '@threeforged/core';
import type { InstancingCandidate } from '../types.js';

export function adjustForAnimations(
  candidates: InstancingCandidate[],
  documents: ParsedDocument[],
): Warning[] {
  const warnings: Warning[] = [];

  const totalChannels = documents.reduce(
    (sum, doc) => sum + doc.animations.reduce((s, a) => s + a.channels, 0),
    0,
  );
  const totalMeshes = documents.reduce((sum, doc) => sum + doc.meshes.length, 0);

  if (totalChannels === 0) return warnings;

  const ratio = totalMeshes > 0 ? totalChannels / totalMeshes : 0;

  for (const candidate of candidates) {
    if (ratio >= 1) {
      // Most meshes are likely animated — low confidence
      candidate.confidence = 'low';
      candidate.confidenceReasons.push(
        `Animation channels (${totalChannels}) >= meshes (${totalMeshes}): most meshes likely animated`,
      );
    } else if (ratio > 0) {
      // Some meshes animated — medium confidence (don't downgrade if already low)
      if (candidate.confidence === 'high') {
        candidate.confidence = 'medium';
      }
      candidate.confidenceReasons.push(
        `Scene has animations (${totalChannels} channels / ${totalMeshes} meshes): some meshes may be animated`,
      );
    }
  }

  if (ratio >= 1) {
    warnings.push({
      rule: 'animation-exclusion',
      severity: 'warn',
      message: `High animation density (${totalChannels} channels / ${totalMeshes} meshes). Animated meshes cannot be instanced — verify candidates manually.`,
    });
  } else if (ratio > 0) {
    warnings.push({
      rule: 'animation-exclusion',
      severity: 'info',
      message: `Scene contains animations (${totalChannels} channels / ${totalMeshes} meshes). Some instancing candidates may be animated.`,
    });
  }

  return warnings;
}
