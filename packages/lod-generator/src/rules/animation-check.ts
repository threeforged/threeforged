import type { Warning } from '@threeforged/core';
import type { Document } from '@gltf-transform/core';

export function checkAnimations(document: Document, fileName: string): Warning[] {
  const warnings: Warning[] = [];
  const animations = document.getRoot().listAnimations();

  if (animations.length === 0) {
    return warnings;
  }

  warnings.push({
    rule: 'animation-check',
    severity: 'warn',
    message:
      `${fileName} contains ${animations.length} animation(s). ` +
      `LOD simplification may affect skinned mesh quality. Review animated meshes after generation.`,
  });

  for (const animation of animations) {
    for (const channel of animation.listChannels()) {
      const targetPath = channel.getTargetPath();
      if (targetPath === 'weights') {
        warnings.push({
          rule: 'animation-check',
          severity: 'warn',
          message: `${fileName} uses morph target animations. Simplified LODs may lose morph target fidelity.`,
        });
        return warnings;
      }
    }
  }

  return warnings;
}
