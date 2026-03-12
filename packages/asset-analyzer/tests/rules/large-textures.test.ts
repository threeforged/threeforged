import { describe, it, expect } from 'vitest';
import { checkLargeTextures } from '../../src/rules/large-textures.js';
import type { ParsedDocument } from '@threeforged/core';
import { DEFAULT_CONFIG } from '@threeforged/core';

describe('checkLargeTextures', () => {
  it('should return no warnings for small textures', () => {
    const doc: ParsedDocument = {
      filePath: '/test/model.glb',
      format: 'glb',
      meshes: [],
      materials: [],
      textures: [{ name: 'tex', width: 1024, height: 1024, format: 'png', gpuMemoryBytes: 4194304 }],
      animations: [],
      drawCalls: 1,
      fileSize: 1024,
    };

    const warnings = checkLargeTextures(doc, DEFAULT_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should warn for oversized textures', () => {
    const doc: ParsedDocument = {
      filePath: '/test/model.glb',
      format: 'glb',
      meshes: [],
      materials: [],
      textures: [{ name: 'tex', width: 8192, height: 8192, format: 'png', gpuMemoryBytes: 268435456 }],
      animations: [],
      drawCalls: 1,
      fileSize: 1024,
    };

    const warnings = checkLargeTextures(doc, DEFAULT_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('large-textures');
  });
});
