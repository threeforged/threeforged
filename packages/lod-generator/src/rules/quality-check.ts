import type { Warning } from '@threeforged/core';
import type { Document } from '@gltf-transform/core';

export function checkQuality(
  document: Document,
  fileName: string,
  minTriangles: number,
): Warning[] {
  const warnings: Warning[] = [];

  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const indicesAccessor = primitive.getIndices();
      const positionAccessor = primitive.getAttribute('POSITION');
      const vertices = positionAccessor ? positionAccessor.getCount() : 0;
      let triangles: number;
      if (indicesAccessor) {
        triangles = Math.floor(indicesAccessor.getCount() / 3);
      } else {
        triangles = Math.floor(vertices / 3);
      }

      const meshName = mesh.getName() || 'unnamed';

      if (triangles <= minTriangles) {
        warnings.push({
          rule: 'quality-check',
          severity: 'info',
          message:
            `Mesh "${meshName}" in ${fileName} has only ${triangles} triangles — ` +
            `already at or below minimum (${minTriangles}). It will be preserved as-is in all LOD levels.`,
          mesh: meshName,
        });
      }
    }
  }

  return warnings;
}
