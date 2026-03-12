import type { ParsedDocument, Warning } from '@threeforged/core';
import type { PerformanceAuditorConfig } from '../types.js';

export function checkTriangleBudget(
  doc: ParsedDocument,
  config: PerformanceAuditorConfig,
): Warning[] {
  const warnings: Warning[] = [];
  const { profile, triangleThresholds } = config;
  const budget = triangleThresholds[profile];
  const totalTriangles = doc.meshes.reduce((sum, m) => sum + m.triangles, 0);

  if (totalTriangles > budget) {
    warnings.push({
      rule: 'triangle-budget',
      severity: 'error',
      message: `${totalTriangles.toLocaleString()} triangles exceed ${profile} budget of ${budget.toLocaleString()}`,
    });
  } else if (totalTriangles > budget * 0.8) {
    warnings.push({
      rule: 'triangle-budget',
      severity: 'warn',
      message: `${totalTriangles.toLocaleString()} triangles approaching ${profile} budget of ${budget.toLocaleString()} (>80%)`,
    });
  }

  return warnings;
}
