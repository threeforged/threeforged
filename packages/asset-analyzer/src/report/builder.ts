import type { ParsedDocument, Warning, AssetReport, PerformanceMetrics } from '@threeforged/core';

function computeMetrics(documents: ParsedDocument[]): PerformanceMetrics {
  let totalTriangles = 0;
  let totalVertices = 0;
  let totalMeshes = 0;
  let totalMaterials = 0;
  let totalTextures = 0;
  let totalDrawCalls = 0;
  let totalAnimations = 0;
  let totalGpuMemoryBytes = 0;

  for (const doc of documents) {
    totalMeshes += doc.meshes.length;
    totalMaterials += doc.materials.length;
    totalTextures += doc.textures.length;
    totalDrawCalls += doc.drawCalls;
    totalAnimations += doc.animations.length;

    for (const mesh of doc.meshes) {
      totalTriangles += mesh.triangles;
      totalVertices += mesh.vertices;
    }

    for (const texture of doc.textures) {
      totalGpuMemoryBytes += texture.gpuMemoryBytes;
    }
  }

  return {
    totalTriangles,
    totalVertices,
    totalMeshes,
    totalMaterials,
    totalTextures,
    totalDrawCalls,
    totalAnimations,
    totalGpuMemoryBytes,
  };
}

export function buildReport(documents: ParsedDocument[], warnings: Warning[]): AssetReport {
  return {
    files: documents,
    warnings,
    metrics: computeMetrics(documents),
    timestamp: new Date().toISOString(),
  };
}
