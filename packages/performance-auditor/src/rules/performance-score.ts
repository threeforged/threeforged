import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig, PerformanceAuditReport } from '../types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safeRatio(value: number, budget: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(budget) || budget <= 0) return 0;
  return value / budget;
}

export function computeGrade(score: number): PerformanceAuditReport['grade'] {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function computePerformanceScore(
  documents: ParsedDocument[],
  config: PerformanceAuditorConfig,
): { score: number; grade: PerformanceAuditReport['grade']; warnings: Warning[] } {
  const { profile, drawCallThresholds, triangleThresholds, vramBudgetMB, maxMaterials } = config;

  let totalDrawCalls = 0;
  let totalTriangles = 0;
  let totalVertices = 0;
  let totalMaterials = 0;
  let totalTextureVram = 0;
  let totalMeshes = 0;
  let unindexedMeshes = 0;

  for (const doc of documents) {
    totalDrawCalls += doc.drawCalls;
    totalMaterials += doc.materials.length;
    totalMeshes += doc.meshes.length;

    for (const mesh of doc.meshes) {
      totalTriangles += mesh.triangles;
      totalVertices += mesh.vertices;
      if (!mesh.hasIndices) unindexedMeshes++;
    }

    for (const texture of doc.textures) {
      totalTextureVram += Number.isFinite(texture.gpuMemoryBytes) && texture.gpuMemoryBytes > 0
        ? texture.gpuMemoryBytes
        : 0;
    }
  }

  const geometryVram = totalVertices * 32;
  const totalVram = totalTextureVram + geometryVram;
  const vramBudgetBytes = vramBudgetMB[profile] * 1024 * 1024;

  // Each factor: 100 when well under budget, 0 when at/over budget
  const drawCallScore = clamp(100 * (1 - safeRatio(totalDrawCalls, drawCallThresholds[profile])), 0, 100);
  const triangleScore = clamp(100 * (1 - safeRatio(totalTriangles, triangleThresholds[profile])), 0, 100);
  const vramScore = clamp(100 * (1 - safeRatio(totalVram, vramBudgetBytes)), 0, 100);
  const materialScore = clamp(100 * (1 - safeRatio(totalMaterials, maxMaterials * 2)), 0, 100);
  const unindexedRatio = totalMeshes > 0 ? unindexedMeshes / totalMeshes : 0;
  const indexedScore = clamp(100 * (1 - unindexedRatio), 0, 100);

  // Weighted composite
  const score = Math.round(
    drawCallScore * 0.25 +
    triangleScore * 0.25 +
    vramScore * 0.20 +
    materialScore * 0.15 +
    indexedScore * 0.15,
  );

  const grade = computeGrade(score);

  const warnings: Warning[] = [];
  if (score >= 70) {
    warnings.push({
      rule: 'performance-score',
      severity: 'info',
      message: `Performance score: ${score}/100 (${grade}) for ${profile} profile`,
    });
  } else if (score >= 40) {
    warnings.push({
      rule: 'performance-score',
      severity: 'warn',
      message: `Performance score: ${score}/100 (${grade}) for ${profile} profile. Optimization recommended.`,
    });
  } else {
    warnings.push({
      rule: 'performance-score',
      severity: 'error',
      message: `Performance score: ${score}/100 (${grade}) for ${profile} profile. Significant optimization needed.`,
    });
  }

  return { score, grade, warnings };
}
