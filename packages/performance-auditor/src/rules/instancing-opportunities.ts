import { basename } from 'node:path';
import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig } from '../types.js';

const MAX_GROUPS = 10;
const MAX_ENTRIES_PER_GROUP = 5;

export function checkInstancingOpportunities(
  documents: ParsedDocument[],
  config: PerformanceAuditorConfig,
): Warning[] {
  const warnings: Warning[] = [];
  const meshSignatures = new Map<string, { name: string; file: string }[]>();

  for (const doc of documents) {
    const fileName = basename(doc.filePath);
    for (const mesh of doc.meshes) {
      const signature = `${mesh.vertices}:${mesh.triangles}`;
      const existing = meshSignatures.get(signature) || [];
      existing.push({ name: mesh.name, file: fileName });
      meshSignatures.set(signature, existing);
    }
  }

  let groupCount = 0;
  for (const [sig, entries] of meshSignatures) {
    if (entries.length < config.instancingMinCount) continue;
    if (groupCount >= MAX_GROUPS) break;
    groupCount++;

    const shown = entries
      .slice(0, MAX_ENTRIES_PER_GROUP)
      .map((e) => `${e.name} (${e.file})`);
    const remaining = entries.length - MAX_ENTRIES_PER_GROUP;
    const suffix = remaining > 0 ? ` and ${remaining} more` : '';

    const severity = entries.length >= 10 ? 'warn' : 'info';
    warnings.push({
      rule: 'instancing-opportunities',
      severity,
      message: `${entries.length} meshes share geometry (${sig.replace(':', 'v/')}t). Consider using InstancedMesh: ${shown.join(', ')}${suffix}`,
    });
  }

  return warnings;
}
