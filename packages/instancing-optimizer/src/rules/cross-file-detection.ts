import type { Warning } from '@threeforged/core';
import type { InstancingCandidate } from '../types.js';

export function detectCrossFileOpportunities(
  candidates: InstancingCandidate[],
): Warning[] {
  const warnings: Warning[] = [];

  for (const candidate of candidates) {
    if (candidate.sourceFiles.length > 1) {
      warnings.push({
        rule: 'cross-file-detection',
        severity: 'info',
        message: `${candidate.groupId}: ${candidate.instanceCount} meshes (${candidate.geometrySignature}) span ${candidate.sourceFiles.length} files (${candidate.sourceFiles.join(', ')}). Consider merging into a single scene for instancing.`,
      });
    }
  }

  return warnings;
}
