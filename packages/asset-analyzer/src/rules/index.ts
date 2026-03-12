import type { ParsedDocument, Warning, ThreeForgedConfig } from '@threeforged/core';
import { checkHighPoly } from './high-poly.js';
import { checkDuplicateMaterials } from './duplicate-materials.js';
import { checkLargeTextures } from './large-textures.js';
import { checkTextureMemory } from './texture-memory.js';
import { checkUnindexedGeometry } from './unindexed-geometry.js';
import { checkDuplicateMeshes } from './duplicate-meshes.js';

export function runAllRules(documents: ParsedDocument[], config: ThreeForgedConfig): Warning[] {
  const warnings: Warning[] = [];

  for (const doc of documents) {
    warnings.push(...checkHighPoly(doc, config));
    warnings.push(...checkDuplicateMaterials(doc));
    warnings.push(...checkLargeTextures(doc, config));
    warnings.push(...checkTextureMemory(doc, config));
    warnings.push(...checkUnindexedGeometry(doc));
  }

  // Cross-document rules
  warnings.push(...checkDuplicateMeshes(documents));

  return warnings;
}
