import { relative } from 'node:path';
import type { ParsedDocument, Warning, PerformanceMetrics } from '@threeforged/core';
import type { PerformanceAuditReport, PerformanceProfile } from '../types.js';

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

  // Add geometry VRAM estimate (position + normal + UV as float32 = 32 bytes/vertex)
  totalGpuMemoryBytes += totalVertices * 32;

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

function sanitizePaths(documents: ParsedDocument[]): ParsedDocument[] {
  const cwd = process.cwd();
  return documents.map((doc) => ({
    ...doc,
    filePath: relative(cwd, doc.filePath) || doc.filePath,
  }));
}

export function buildAuditReport(
  documents: ParsedDocument[],
  warnings: Warning[],
  profile: PerformanceProfile,
  score: number,
  grade: PerformanceAuditReport['grade'],
): PerformanceAuditReport {
  const sanitized = sanitizePaths(documents);
  return {
    files: sanitized,
    warnings,
    metrics: computeMetrics(documents),
    profile,
    score,
    grade,
    timestamp: new Date().toISOString(),
  };
}
