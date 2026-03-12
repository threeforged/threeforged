import type { Warning } from '@threeforged/core';
import type { Document } from '@gltf-transform/core';

/**
 * Detects flat-shaded / disconnected geometry where simplification
 * will have little or no effect.
 *
 * When vertices ≈ 3× triangles, each face has its own unique vertices
 * (typically for flat/hard-edge shading). meshoptimizer needs shared
 * vertices between adjacent triangles to collapse edges, so these
 * models will show 0% reduction.
 */
export function checkTopology(document: Document, fileName: string): Warning[] {
  const warnings: Warning[] = [];

  let totalTriangles = 0;
  let totalVertices = 0;
  let flatShadedMeshCount = 0;
  let meshCount = 0;

  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const positionAccessor = primitive.getAttribute('POSITION');
      const indicesAccessor = primitive.getIndices();
      const vertices = positionAccessor ? positionAccessor.getCount() : 0;
      let triangles: number;
      if (indicesAccessor) {
        triangles = Math.floor(indicesAccessor.getCount() / 3);
      } else {
        triangles = Math.floor(vertices / 3);
      }

      meshCount++;
      totalTriangles += triangles;
      totalVertices += vertices;

      // Flat-shaded: each triangle has 3 unique vertices (no sharing)
      // Allow a small tolerance for meshes that are mostly flat-shaded
      if (triangles > 0 && vertices >= triangles * 2.8) {
        flatShadedMeshCount++;
      }
    }
  }

  if (flatShadedMeshCount > 0 && flatShadedMeshCount === meshCount) {
    warnings.push({
      rule: 'topology-check',
      severity: 'warn',
      message:
        `${fileName} uses flat-shaded geometry (${totalVertices.toLocaleString()} vertices / ` +
        `${totalTriangles.toLocaleString()} triangles ≈ ${(totalVertices / Math.max(totalTriangles, 1)).toFixed(1)} verts/tri). ` +
        `Mesh simplification requires shared vertices between faces and will have little or no effect on this model. ` +
        `This is common for game-ready assets that are already optimized for real-time rendering.`,
    });
  } else if (flatShadedMeshCount > 0) {
    warnings.push({
      rule: 'topology-check',
      severity: 'info',
      message:
        `${flatShadedMeshCount} of ${meshCount} meshes in ${fileName} appear flat-shaded. ` +
        `Those meshes may not simplify well. Smooth-shaded meshes in the same file should still benefit.`,
    });
  }

  return warnings;
}
