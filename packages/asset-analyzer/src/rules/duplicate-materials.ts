import type { ParsedDocument, Warning } from '@threeforged/core';

function hashMaterial(properties: Record<string, unknown>): string {
  return JSON.stringify(properties, Object.keys(properties).sort());
}

export function checkDuplicateMaterials(doc: ParsedDocument): Warning[] {
  const warnings: Warning[] = [];
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
        rule: 'duplicate-materials',
        severity: 'warn',
        message: `Duplicate materials found: ${names.join(', ')}. Consider merging them.`,
        material: names[0],
      });
    }
  }

  return warnings;
}
