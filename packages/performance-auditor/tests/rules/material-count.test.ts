import { describe, it, expect } from 'vitest';
import { checkMaterialCount } from '../../src/rules/material-count.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeMockDoc(materialCount: number, duplicates = false): ParsedDocument {
  const materials = Array.from({ length: materialCount }, (_, i) => ({
    name: `Material_${i}`,
    type: 'MeshStandardMaterial',
    properties: duplicates ? { color: 'red' } : { color: `color_${i}` },
    textures: [],
  }));

  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: [],
    materials,
    textures: [],
    animations: [],
    drawCalls: materialCount,
    fileSize: 1024,
  };
}

describe('checkMaterialCount', () => {
  it('should return no warnings for low material count', () => {
    const warnings = checkMaterialCount(makeMockDoc(5), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should warn when exceeding maxMaterials', () => {
    const warnings = checkMaterialCount(makeMockDoc(25), DEFAULT_AUDITOR_CONFIG);
    expect(warnings.some((w) => w.severity === 'warn' && w.rule === 'material-count')).toBe(true);
  });

  it('should error when exceeding maxMaterialsError', () => {
    const warnings = checkMaterialCount(makeMockDoc(55), DEFAULT_AUDITOR_CONFIG);
    expect(warnings.some((w) => w.severity === 'error')).toBe(true);
  });

  it('should detect duplicate materials', () => {
    const warnings = checkMaterialCount(makeMockDoc(5, true), DEFAULT_AUDITOR_CONFIG);
    expect(warnings.some((w) => w.message.includes('Duplicate materials'))).toBe(true);
  });

  it('should not flag duplicates when all unique', () => {
    const warnings = checkMaterialCount(makeMockDoc(5, false), DEFAULT_AUDITOR_CONFIG);
    expect(warnings.some((w) => w.message.includes('Duplicate'))).toBe(false);
  });
});
