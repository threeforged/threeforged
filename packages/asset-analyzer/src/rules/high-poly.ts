import type { ParsedDocument, Warning, ThreeForgedConfig } from '@threeforged/core';

export function checkHighPoly(doc: ParsedDocument, config: ThreeForgedConfig): Warning[] {
  const warnings: Warning[] = [];
  const { medium, large } = config.polyCountThresholds;

  for (const mesh of doc.meshes) {
    if (mesh.triangles > large) {
      warnings.push({
        rule: 'high-poly',
        severity: 'error',
        message: `Mesh "${mesh.name}" has ${mesh.triangles.toLocaleString()} triangles (threshold: ${large.toLocaleString()})`,
        mesh: mesh.name,
      });
    } else if (mesh.triangles > medium) {
      warnings.push({
        rule: 'high-poly',
        severity: 'warn',
        message: `Mesh "${mesh.name}" has ${mesh.triangles.toLocaleString()} triangles (threshold: ${medium.toLocaleString()})`,
        mesh: mesh.name,
      });
    }
  }

  return warnings;
}
