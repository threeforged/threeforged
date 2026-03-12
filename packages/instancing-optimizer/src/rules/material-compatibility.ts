import type { ParsedDocument, Warning } from '@threeforged/core';
import type { InstancingCandidate, InstancingOptimizerConfig } from '../types.js';

function findCommonPrefix(names: string[]): string | null {
  if (names.length < 2) return null;

  // Try splitting on common separators: _, -, .
  for (const sep of ['_', '-', '.']) {
    const prefixes = names.map((n) => {
      const parts = n.split(sep);
      return parts.length > 1 ? parts[0] : null;
    });

    const first = prefixes[0];
    if (first && prefixes.every((p) => p === first)) {
      return first;
    }
  }

  return null;
}

export function adjustForMaterials(
  candidates: InstancingCandidate[],
  documents: ParsedDocument[],
  config: InstancingOptimizerConfig,
): Warning[] {
  const warnings: Warning[] = [];

  const totalMaterials = documents.reduce((sum, doc) => sum + doc.materials.length, 0);
  const totalMeshes = documents.reduce((sum, doc) => sum + doc.meshes.length, 0);

  if (totalMeshes === 0) return warnings;

  const materialToMeshRatio = totalMaterials / totalMeshes;
  const isHeterogeneous = materialToMeshRatio > config.materialHeterogeneityThreshold;

  for (const candidate of candidates) {
    const meshNames = candidate.meshes.map((m) => m.name);
    const hasCommonPrefix = findCommonPrefix(meshNames) !== null;

    if (isHeterogeneous && !hasCommonPrefix) {
      // High material diversity and no name pattern — likely different materials
      if (candidate.confidence === 'high') {
        candidate.confidence = 'medium';
      } else if (candidate.confidence === 'medium') {
        candidate.confidence = 'low';
      }
      candidate.confidenceReasons.push(
        `High material-to-mesh ratio (${totalMaterials}/${totalMeshes} = ${materialToMeshRatio.toFixed(2)}): meshes may use different materials`,
      );
    } else if (hasCommonPrefix) {
      candidate.confidenceReasons.push(
        'Mesh names share a common prefix — likely same material',
      );
    }
  }

  if (isHeterogeneous) {
    warnings.push({
      rule: 'material-compatibility',
      severity: 'info',
      message: `Material-to-mesh ratio is ${materialToMeshRatio.toFixed(2)} (threshold: ${config.materialHeterogeneityThreshold}). Some candidates may use different materials — instancing requires shared materials.`,
    });
  }

  return warnings;
}
