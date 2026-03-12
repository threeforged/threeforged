import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig } from '../types.js';

export function checkGeometryComplexity(
  doc: ParsedDocument,
  config: PerformanceAuditorConfig,
): Warning[] {
  const warnings: Warning[] = [];

  for (const mesh of doc.meshes) {
    // Dense geometry check (triangle-to-vertex ratio)
    if (mesh.vertices > 0) {
      const ratio = mesh.triangles / mesh.vertices;
      if (ratio > 3) {
        warnings.push({
          rule: 'geometry-complexity',
          severity: 'error',
          message: `Mesh "${mesh.name}" has very dense geometry (${ratio.toFixed(1)} tri/vert ratio). Consider simplifying.`,
          mesh: mesh.name,
        });
      } else if (ratio > 1.5) {
        warnings.push({
          rule: 'geometry-complexity',
          severity: 'warn',
          message: `Mesh "${mesh.name}" has dense geometry (${ratio.toFixed(1)} tri/vert ratio).`,
          mesh: mesh.name,
        });
      }
    }

    // Unindexed geometry check
    if (!mesh.hasIndices) {
      warnings.push({
        rule: 'geometry-complexity',
        severity: 'warn',
        message: `Mesh "${mesh.name}" uses unindexed geometry. Indexing reduces VRAM usage and improves vertex cache performance.`,
        mesh: mesh.name,
      });
    }

    // Vertex-heavy mesh check
    if (mesh.vertices > 1_000_000) {
      warnings.push({
        rule: 'geometry-complexity',
        severity: 'error',
        message: `Mesh "${mesh.name}" has ${mesh.vertices.toLocaleString()} vertices (>1M). Consider splitting or using LODs.`,
        mesh: mesh.name,
      });
    } else if (mesh.vertices > config.maxVerticesPerMesh) {
      warnings.push({
        rule: 'geometry-complexity',
        severity: 'warn',
        message: `Mesh "${mesh.name}" has ${mesh.vertices.toLocaleString()} vertices (>${config.maxVerticesPerMesh.toLocaleString()}). Consider LODs for lower-end devices.`,
        mesh: mesh.name,
      });
    }
  }

  return warnings;
}
