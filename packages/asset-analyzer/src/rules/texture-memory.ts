import type { ParsedDocument, Warning, ThreeForgedConfig } from '@threeforged/core';
import { formatBytes } from '@threeforged/core';

export function checkTextureMemory(doc: ParsedDocument, config: ThreeForgedConfig): Warning[] {
  const warnings: Warning[] = [];
  const totalGpuBytes = doc.textures.reduce((sum, t) => sum + t.gpuMemoryBytes, 0);
  const maxBytes = config.maxTextureMB * 1024 * 1024;

  if (totalGpuBytes > maxBytes) {
    warnings.push({
      rule: 'texture-memory',
      severity: 'error',
      message: `Total GPU texture memory ${formatBytes(totalGpuBytes)} exceeds limit of ${config.maxTextureMB} MB`,
    });
  }

  return warnings;
}
