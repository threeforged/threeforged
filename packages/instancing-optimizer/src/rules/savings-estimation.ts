import type { Warning } from '@threeforged/core';
import type { InstancingCandidate } from '../types.js';

// VRAM per vertex: position (12) + normal (12) + UV (8) = 32 bytes
const BYTES_PER_VERTEX = 32;

export function estimateSavings(
  candidates: InstancingCandidate[],
  totalDrawCalls: number,
): Warning[] {
  const warnings: Warning[] = [];

  let totalDrawCallsSaved = 0;

  for (const candidate of candidates) {
    // Instancing collapses N draw calls into 1
    candidate.drawCallsSaved = candidate.instanceCount - 1;
    // Instancing doesn't reduce triangle count — GPU still renders all triangles
    candidate.trianglesSaved = 0;
    // VRAM savings: only 1 geometry buffer instead of N
    const perMeshVram = candidate.vertices * BYTES_PER_VERTEX;
    const saved = (candidate.instanceCount - 1) * perMeshVram;
    candidate.vramSavedBytes = Number.isFinite(saved) && saved >= 0 ? saved : 0;

    totalDrawCallsSaved += candidate.drawCallsSaved;
  }

  // Severity-weighted warning based on draw call reduction percentage
  if (totalDrawCalls > 0) {
    const reductionPercent = (totalDrawCallsSaved / totalDrawCalls) * 100;

    if (reductionPercent >= 50) {
      warnings.push({
        rule: 'savings-estimation',
        severity: 'error',
        message: `Instancing could reduce draw calls by ${reductionPercent.toFixed(1)}% (${totalDrawCallsSaved}/${totalDrawCalls}). This scene has severe draw call overhead.`,
      });
    } else if (reductionPercent >= 20) {
      warnings.push({
        rule: 'savings-estimation',
        severity: 'warn',
        message: `Instancing could reduce draw calls by ${reductionPercent.toFixed(1)}% (${totalDrawCallsSaved}/${totalDrawCalls}). Consider converting repeated meshes to InstancedMesh.`,
      });
    } else if (reductionPercent >= 5) {
      warnings.push({
        rule: 'savings-estimation',
        severity: 'info',
        message: `Instancing could reduce draw calls by ${reductionPercent.toFixed(1)}% (${totalDrawCallsSaved}/${totalDrawCalls}).`,
      });
    }
  }

  return warnings;
}
