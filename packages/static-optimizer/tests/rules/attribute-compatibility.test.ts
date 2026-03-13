import { describe, it, expect } from 'vitest';
import { checkAttributeCompatibility } from '../../src/rules/attribute-compatibility.js';
import type { ParsedDocument } from '@threeforged/core';
import type { StaticMergeGroup } from '../../src/types.js';

function makeDoc(overrides: Partial<ParsedDocument> = {}): ParsedDocument {
  return {
    filePath: '/project/scene.glb',
    format: 'glb',
    meshes: [],
    materials: [],
    textures: [],
    animations: [],
    drawCalls: 0,
    fileSize: 1024,
    ...overrides,
  };
}

function makeGroup(overrides: Partial<StaticMergeGroup> = {}): StaticMergeGroup {
  return {
    groupId: 'merge-0',
    materialSignature: 'PBR',
    materialName: 'Mat1',
    meshCount: 2,
    totalVertices: 120,
    totalTriangles: 200,
    drawCallsSaved: 0,
    vramOverheadBytes: 0,
    exceedsIndexLimit: false,
    meshes: [],
    totalMeshCount: 2,
    sourceFiles: ['scene.glb'],
    warnings: [],
    ...overrides,
  };
}

describe('checkAttributeCompatibility', () => {
  it('should not warn when all meshes are indexed', () => {
    const group = makeGroup({
      meshes: [
        { name: 'A', file: 'scene.glb', vertices: 60, triangles: 100 },
        { name: 'B', file: 'scene.glb', vertices: 60, triangles: 100 },
      ],
    });
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'B', triangles: 100, vertices: 60, hasIndices: true },
      ],
    });
    const warnings = checkAttributeCompatibility([group], [doc]);
    expect(warnings).toHaveLength(0);
    expect(group.warnings).toHaveLength(0);
  });

  it('should not warn when all meshes are non-indexed', () => {
    const group = makeGroup({
      meshes: [
        { name: 'A', file: 'scene.glb', vertices: 60, triangles: 100 },
        { name: 'B', file: 'scene.glb', vertices: 60, triangles: 100 },
      ],
    });
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: false },
        { name: 'B', triangles: 100, vertices: 60, hasIndices: false },
      ],
    });
    const warnings = checkAttributeCompatibility([group], [doc]);
    expect(warnings).toHaveLength(0);
  });

  it('should warn when mixing indexed and non-indexed geometry', () => {
    const group = makeGroup({
      meshes: [
        { name: 'A', file: 'scene.glb', vertices: 60, triangles: 100 },
        { name: 'B', file: 'scene.glb', vertices: 60, triangles: 100 },
      ],
    });
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'B', triangles: 100, vertices: 60, hasIndices: false },
      ],
    });
    const warnings = checkAttributeCompatibility([group], [doc]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('attribute-compatibility');
    expect(warnings[0].severity).toBe('warn');
    expect(group.warnings.length).toBeGreaterThan(0);
  });

  it('should check each group independently', () => {
    const group1 = makeGroup({
      groupId: 'merge-0',
      meshes: [
        { name: 'A', file: 'scene.glb', vertices: 60, triangles: 100 },
        { name: 'B', file: 'scene.glb', vertices: 60, triangles: 100 },
      ],
    });
    const group2 = makeGroup({
      groupId: 'merge-1',
      meshes: [
        { name: 'C', file: 'scene.glb', vertices: 60, triangles: 100 },
        { name: 'D', file: 'scene.glb', vertices: 60, triangles: 100 },
      ],
    });
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'B', triangles: 100, vertices: 60, hasIndices: false },
        { name: 'C', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'D', triangles: 100, vertices: 60, hasIndices: true },
      ],
    });
    const warnings = checkAttributeCompatibility([group1, group2], [doc]);
    expect(warnings).toHaveLength(1);
    expect(group1.warnings.length).toBeGreaterThan(0);
    expect(group2.warnings).toHaveLength(0);
  });

  it('should handle empty groups', () => {
    const warnings = checkAttributeCompatibility([], []);
    expect(warnings).toHaveLength(0);
  });
});
