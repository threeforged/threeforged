import type { ParsedDocument, Warning } from '@threeforged/core';

export function checkUnindexedGeometry(doc: ParsedDocument): Warning[] {
  const warnings: Warning[] = [];

  for (const mesh of doc.meshes) {
    if (!mesh.hasIndices) {
      warnings.push({
        rule: 'unindexed-geometry',
        severity: 'warn',
        message: `Mesh "${mesh.name}" uses non-indexed geometry. Consider indexing to reduce memory usage.`,
        mesh: mesh.name,
      });
    }
  }

  return warnings;
}
