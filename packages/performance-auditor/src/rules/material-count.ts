import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig } from '../types.js';

function hashMaterial(properties: Record<string, unknown>): string {
  return JSON.stringify(properties, Object.keys(properties).sort());
}

export function checkMaterialCount(
  doc: ParsedDocument,
  config: PerformanceAuditorConfig,
): Warning[] {
  const warnings: Warning[] = [];
  const materialCount = doc.materials.length;

  if (materialCount > config.maxMaterialsError) {
    warnings.push({
      rule: 'material-count',
      severity: 'error',
      message: `${materialCount} materials exceed error threshold of ${config.maxMaterialsError}. Each unique material may cause an additional draw call.`,
    });
  } else if (materialCount > config.maxMaterials) {
    warnings.push({
      rule: 'material-count',
      severity: 'warn',
      message: `${materialCount} materials exceed recommended maximum of ${config.maxMaterials}. Consider merging materials to reduce draw calls.`,
    });
  }

  // Detect duplicates
  const hashMap = new Map<string, string[]>();
  for (const material of doc.materials) {
    const hash = hashMaterial(material.properties);
    const existing = hashMap.get(hash) || [];
    existing.push(material.name);
    hashMap.set(hash, existing);
  }

  for (const [, names] of hashMap) {
    if (names.length > 1) {
      warnings.push({
        rule: 'material-count',
        severity: 'warn',
        message: `Duplicate materials found: ${names.join(', ')}. Merging would reduce draw calls.`,
        material: names[0],
      });
    }
  }

  return warnings;
}
