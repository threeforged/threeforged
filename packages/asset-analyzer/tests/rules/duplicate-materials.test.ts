import { describe, it, expect } from 'vitest';
import { checkDuplicateMaterials } from '../../src/rules/duplicate-materials.js';
import type { ParsedDocument } from '@threeforged/core';

describe('checkDuplicateMaterials', () => {
  it('should return no warnings when materials are unique', () => {
    const doc: ParsedDocument = {
      filePath: '/test/model.glb',
      format: 'glb',
      meshes: [],
      materials: [
        { name: 'Mat1', type: 'PBR', properties: { color: 'red' }, textures: [] },
        { name: 'Mat2', type: 'PBR', properties: { color: 'blue' }, textures: [] },
      ],
      textures: [],
      animations: [],
      drawCalls: 1,
      fileSize: 1024,
    };

    const warnings = checkDuplicateMaterials(doc);
    expect(warnings).toHaveLength(0);
  });

  it('should warn when duplicate materials are found', () => {
    const doc: ParsedDocument = {
      filePath: '/test/model.glb',
      format: 'glb',
      meshes: [],
      materials: [
        { name: 'Mat1', type: 'PBR', properties: { color: 'red' }, textures: [] },
        { name: 'Mat2', type: 'PBR', properties: { color: 'red' }, textures: [] },
      ],
      textures: [],
      animations: [],
      drawCalls: 1,
      fileSize: 1024,
    };

    const warnings = checkDuplicateMaterials(doc);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('duplicate-materials');
  });
});
