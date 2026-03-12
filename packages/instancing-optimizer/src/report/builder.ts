import { relative } from 'node:path';
import type { ParsedDocument, Warning } from '@threeforged/core';
import type { InstancingCandidate, InstancingMetrics, InstancingReport } from '../types.js';

function computeMetrics(
  documents: ParsedDocument[],
  candidates: InstancingCandidate[],
): InstancingMetrics {
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

  // Add geometry VRAM estimate (position + normal + UV as float32 = 32 bytes/vertex)
  totalGpuMemoryBytes += totalVertices * 32;

  const hasAnimations = totalAnimations > 0;

  // Unique geometry count: signatures that appear at all
  const uniqueSignatures = new Set<string>();
  for (const doc of documents) {
    for (const mesh of doc.meshes) {
      uniqueSignatures.add(`${mesh.vertices}:${mesh.triangles}:${mesh.hasIndices}`);
    }
  }
  const uniqueGeometryCount = uniqueSignatures.size;
  const geometryReuseRatio = uniqueGeometryCount > 0 ? totalMeshes / uniqueGeometryCount : 0;

  const totalDrawCallsSaved = candidates.reduce((sum, c) => sum + c.drawCallsSaved, 0);
  const totalVramSavedBytes = candidates.reduce((sum, c) => sum + c.vramSavedBytes, 0);
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
    candidateGroups: candidates.length,
    totalInstancingCandidates: candidates.reduce((sum, c) => sum + c.instanceCount, 0),
    totalDrawCallsSaved,
    totalVramSavedBytes,
    drawCallReductionPercent: Number.isFinite(drawCallReductionPercent) ? drawCallReductionPercent : 0,
    hasAnimations,
    uniqueGeometryCount,
    geometryReuseRatio: Number.isFinite(geometryReuseRatio) ? geometryReuseRatio : 0,
  };
}

function sanitizePaths(documents: ParsedDocument[]): ParsedDocument[] {
  const cwd = process.cwd();
  return documents.map((doc) => ({
    ...doc,
    filePath: relative(cwd, doc.filePath) || doc.filePath,
  }));
}

export function buildInstancingReport(
  documents: ParsedDocument[],
  warnings: Warning[],
  candidates: InstancingCandidate[],
): InstancingReport {
  const sanitized = sanitizePaths(documents);
  return {
    files: sanitized,
    warnings,
    metrics: computeMetrics(documents, candidates),
    candidates,
    timestamp: new Date().toISOString(),
  };
}
