import type { Warning } from '@threeforged/core';
import type { Document } from '@gltf-transform/core';
import { checkAnimations } from './animation-check.js';
import { checkQuality } from './quality-check.js';
import { checkTopology } from './topology-check.js';

export interface LODRulesResult {
  warnings: Warning[];
}

export function runAllRules(
  document: Document,
  fileName: string,
  minTriangles: number,
): LODRulesResult {
  const warnings: Warning[] = [];

  warnings.push(...checkAnimations(document, fileName));
  warnings.push(...checkQuality(document, fileName, minTriangles));
  warnings.push(...checkTopology(document, fileName));

  return { warnings };
}
