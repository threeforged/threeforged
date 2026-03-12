import { basename } from 'node:path';
import type { ParsedDocument, Warning } from '@threeforged/core';

const MAX_LISTED = 5;

export function checkDuplicateMeshes(documents: ParsedDocument[]): Warning[] {
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

  // Deduplicate entries with the same name+file to avoid noise
  for (const [sig, entries] of meshSignatures) {
    const uniqueFiles = new Set(entries.map((e) => e.file));
    // Only warn if duplicates span multiple files, or there are many within one file
    if (entries.length < 2) continue;
    if (uniqueFiles.size < 2 && entries.length < 4) continue;

    const shown = entries.slice(0, MAX_LISTED).map((e) => `${e.name} (${e.file})`);
    const remaining = entries.length - MAX_LISTED;
    const suffix = remaining > 0 ? ` and ${remaining} more` : '';

    warnings.push({
      rule: 'duplicate-meshes',
      severity: 'info',
      message: `${entries.length} meshes share geometry (${sig.replace(':', 'v/')}t): ${shown.join(', ')}${suffix}`,
    });
  }

  return warnings;
}
