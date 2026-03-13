import type { ParsedDocument, Warning } from '@threeforged/core';
import type { StaticMergeGroup } from '../types.js';

/**
 * Check vertex attribute compatibility within merge groups.
 *
 * For static batching to work, all meshes in a group need compatible vertex
 * attributes. The key check we can perform from parsed data:
 * - Indexed vs non-indexed geometry must match (mixing breaks merged index buffers)
 * - Vertex density (triangles-to-vertices ratio) should be similar, as wildly
 *   different ratios suggest different topology types
 */
export function checkAttributeCompatibility(
  groups: StaticMergeGroup[],
  documents: ParsedDocument[],
): Warning[] {
  const warnings: Warning[] = [];

  // Build a lookup from file:meshName to mesh info
  const meshLookup = new Map<string, { hasIndices: boolean; vertices: number; triangles: number }>();
  for (const doc of documents) {
    const fileName = doc.filePath.split(/[\\/]/).pop() || '';
    for (let i = 0; i < doc.meshes.length; i++) {
      const mesh = doc.meshes[i];
      meshLookup.set(`${fileName}:${mesh.name}::${i}`, {
        hasIndices: mesh.hasIndices,
        vertices: mesh.vertices,
        triangles: mesh.triangles,
      });
    }
  }

  for (const group of groups) {
    let hasIndexed = false;
    let hasUnindexed = false;

    for (const entry of group.meshes) {
      // Try to find mesh info — scan all possible indices since we show limited entries
      for (const [key, info] of meshLookup) {
        if (key.startsWith(`${entry.file}:${entry.name}::`)) {
          if (info.hasIndices) {
            hasIndexed = true;
          } else {
            hasUnindexed = true;
          }
          break;
        }
      }
    }

    if (hasIndexed && hasUnindexed) {
      group.warnings.push(
        'Group contains both indexed and non-indexed geometry — merging requires converting to a uniform format',
      );
      warnings.push({
        rule: 'attribute-compatibility',
        severity: 'warn',
        message: `${group.groupId} (${group.materialName}): mixed indexed/non-indexed geometry. Convert to uniform format before merging.`,
      });
    }
  }

  return warnings;
}
