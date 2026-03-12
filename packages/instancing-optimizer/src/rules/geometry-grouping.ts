import { basename } from 'node:path';
import type { ParsedDocument } from '@threeforged/core';
import type { InstancingCandidate, InstancingOptimizerConfig } from '../types.js';

export function groupByGeometry(
  documents: ParsedDocument[],
  config: InstancingOptimizerConfig,
): InstancingCandidate[] {
  const signatureMap = new Map<string, { name: string; file: string; vertices: number; triangles: number; hasIndices: boolean }[]>();

  for (const doc of documents) {
    const fileName = basename(doc.filePath);
    for (const mesh of doc.meshes) {
      if (mesh.triangles < config.minTrianglesPerMesh) continue;

      const signature = `${mesh.vertices}:${mesh.triangles}:${mesh.hasIndices ? 'indexed' : 'unindexed'}`;
      const existing = signatureMap.get(signature) || [];
      existing.push({
        name: mesh.name,
        file: fileName,
        vertices: mesh.vertices,
        triangles: mesh.triangles,
        hasIndices: mesh.hasIndices,
      });
      signatureMap.set(signature, existing);
    }
  }

  const candidates: InstancingCandidate[] = [];

  // Sort by impact: most instances first, then by vertex count (more VRAM savings)
  const sortedEntries = [...signatureMap.entries()]
    .filter(([, entries]) => entries.length >= config.instancingMinCount)
    .sort((a, b) => {
      const countDiff = b[1].length - a[1].length;
      if (countDiff !== 0) return countDiff;
      return b[1][0].vertices - a[1][0].vertices;
    });

  for (let i = 0; i < Math.min(sortedEntries.length, config.maxGroups); i++) {
    const [, entries] = sortedEntries[i];
    const first = entries[0];
    const sigLabel = `${first.vertices}v/${first.triangles}t/${first.hasIndices ? 'indexed' : 'unindexed'}`;

    const sourceFiles = [...new Set(entries.map((e) => e.file))];
    const shownMeshes = entries.slice(0, config.maxEntriesPerGroup).map((e) => ({
      name: e.name,
      file: e.file,
    }));

    candidates.push({
      groupId: `group-${i}`,
      geometrySignature: sigLabel,
      vertices: first.vertices,
      triangles: first.triangles,
      hasIndices: first.hasIndices,
      instanceCount: entries.length,
      drawCallsSaved: 0,
      trianglesSaved: 0,
      vramSavedBytes: 0,
      confidence: 'high',
      confidenceReasons: ['Identical geometry signature'],
      meshes: shownMeshes,
      totalMeshCount: entries.length,
      sourceFiles,
    });
  }

  return candidates;
}
