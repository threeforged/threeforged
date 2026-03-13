import { relative } from 'node:path';
import type { ParsedDocument, Warning } from '@threeforged/core';
import type { StaticMergeGroup, StaticMetrics, StaticReport, StaticFileResult } from '../types.js';

function computeMetrics(
  documents: ParsedDocument[],
  groups: StaticMergeGroup[],
  animatedMeshCount: number,
): StaticMetrics {
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

  // Geometry VRAM estimate: position + normal + UV = 32 bytes/vertex
  totalGpuMemoryBytes += totalVertices * 32;

  const hasAnimations = totalAnimations > 0;
  const staticMeshCount = Math.max(0, totalMeshes - animatedMeshCount);

  const totalDrawCallsSaved = groups.reduce((sum, g) => sum + g.drawCallsSaved, 0);
  const totalMergeableMeshes = groups.reduce((sum, g) => sum + g.meshCount, 0);
  const totalMergedVertices = groups.reduce((sum, g) => sum + g.totalVertices, 0);
  const totalMergedTriangles = groups.reduce((sum, g) => sum + g.totalTriangles, 0);
  const drawCallReductionPercent =
    totalDrawCalls > 0 ? (totalDrawCallsSaved / totalDrawCalls) * 100 : 0;

  return {
    totalTriangles,
    totalVertices,
    totalMeshes,
    totalMaterials,
    totalTextures,
    totalDrawCalls,
    totalAnimations,
    totalGpuMemoryBytes,
    mergeGroups: groups.length,
    totalMergeableMeshes,
    totalDrawCallsSaved,
    drawCallReductionPercent: Number.isFinite(drawCallReductionPercent)
      ? drawCallReductionPercent
      : 0,
    totalMergedVertices,
    totalMergedTriangles,
    hasAnimations,
    staticMeshCount,
    animatedMeshCount,
  };
}

function sanitizePaths(documents: ParsedDocument[]): ParsedDocument[] {
  const cwd = process.cwd();
  return documents.map((doc) => ({
    ...doc,
    filePath: relative(cwd, doc.filePath) || doc.filePath,
  }));
}

export function buildStaticReport(
  documents: ParsedDocument[],
  warnings: Warning[],
  groups: StaticMergeGroup[],
  animatedMeshCount: number,
  writeMode: boolean = false,
  fileResults: StaticFileResult[] = [],
): StaticReport {
  const sanitized = sanitizePaths(documents);
  return {
    files: sanitized,
    warnings,
    metrics: computeMetrics(documents, groups, animatedMeshCount),
    groups,
    timestamp: new Date().toISOString(),
    writeMode,
    fileResults,
  };
}
