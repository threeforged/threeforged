import type { ParsedDocument, Warning, ThreeForgedConfig } from '@threeforged/core';

export function checkLargeTextures(doc: ParsedDocument, config: ThreeForgedConfig): Warning[] {
  const warnings: Warning[] = [];

  for (const texture of doc.textures) {
    if (texture.width > config.maxTextureSize || texture.height > config.maxTextureSize) {
      warnings.push({
        rule: 'large-textures',
        severity: 'warn',
        message: `Texture "${texture.name}" is ${texture.width}x${texture.height} (max: ${config.maxTextureSize}x${config.maxTextureSize})`,
        texture: texture.name,
      });
    }
  }

  return warnings;
}
