import type { ParsedDocument, Warning } from '@threeforged/core';
import { formatBytes } from '@threeforged/core';
import type { PerformanceAuditorConfig } from '../types.js';

const BYTES_PER_VERTEX = 32; // position(12) + normal(12) + uv(8) as float32

function safePositive(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function checkVramUsage(
  doc: ParsedDocument,
  config: PerformanceAuditorConfig,
): Warning[] {
  const warnings: Warning[] = [];
  const { profile, vramBudgetMB } = config;
  const budgetBytes = vramBudgetMB[profile] * 1024 * 1024;

  const textureVram = doc.textures.reduce(
    (sum, t) => sum + safePositive(t.gpuMemoryBytes),
    0,
  );

  const geometryVram = doc.meshes.reduce(
    (sum, m) => sum + safePositive(m.vertices) * BYTES_PER_VERTEX,
    0,
  );

  const totalVram = textureVram + geometryVram;

  if (totalVram > budgetBytes) {
    warnings.push({
      rule: 'vram-usage',
      severity: 'error',
      message: `Estimated VRAM ${formatBytes(totalVram)} (textures: ${formatBytes(textureVram)}, geometry: ${formatBytes(geometryVram)}) exceeds ${profile} budget of ${vramBudgetMB[profile]} MB`,
    });
  } else if (totalVram > budgetBytes * 0.75) {
    warnings.push({
      rule: 'vram-usage',
      severity: 'warn',
      message: `Estimated VRAM ${formatBytes(totalVram)} approaching ${profile} budget of ${vramBudgetMB[profile]} MB (>75%)`,
    });
  }

  return warnings;
}
