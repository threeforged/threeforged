import { describe, it, expect } from 'vitest';
import { checkHighPoly } from '../../src/rules/high-poly.js';
import type { ParsedDocument } from '@threeforged/core';
import { DEFAULT_CONFIG } from '@threeforged/core';

function makeMockDoc(triangles: number): ParsedDocument {
  return {
    filePath: '/test/model.glb',
    format: 'glb',
    meshes: [{ name: 'TestMesh', triangles, vertices: triangles * 3, hasIndices: true }],
    materials: [],
    textures: [],
    animations: [],
    drawCalls: 1,
    fileSize: 1024,
  };
}

describe('checkHighPoly', () => {
  it('should return no warnings for low-poly meshes', () => {
    const doc = makeMockDoc(1000);
    const warnings = checkHighPoly(doc, DEFAULT_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should warn for medium-poly meshes', () => {
    const doc = makeMockDoc(60_000);
    const warnings = checkHighPoly(doc, DEFAULT_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
    expect(warnings[0].rule).toBe('high-poly');
  });

  it('should error for high-poly meshes', () => {
    const doc = makeMockDoc(150_000);
    const warnings = checkHighPoly(doc, DEFAULT_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('error');
  });
});
