import { describe, it, expect } from 'vitest';
import { excludeAnimatedMeshes } from '../../src/rules/animation-exclusion.js';
import type { ParsedDocument } from '@threeforged/core';
import type { StaticMergeGroup } from '../../src/types.js';

function makeDoc(overrides: Partial<ParsedDocument> = {}): ParsedDocument {
  return {
    filePath: '/project/scene.glb',
    format: 'glb',
    meshes: [
      { name: 'Mesh1', triangles: 100, vertices: 60, hasIndices: true },
      { name: 'Mesh2', triangles: 100, vertices: 60, hasIndices: true },
    ],
    materials: [],
    textures: [],
    animations: [],
    drawCalls: 2,
    fileSize: 1024,
    ...overrides,
  };
}

function makeGroup(overrides: Partial<StaticMergeGroup> = {}): StaticMergeGroup {
  return {
    groupId: 'merge-0',
    materialSignature: 'PBR',
    materialName: 'Mat1',
    meshCount: 3,
    totalVertices: 180,
    totalTriangles: 300,
    drawCallsSaved: 0,
    vramOverheadBytes: 0,
    exceedsIndexLimit: false,
    meshes: [],
    totalMeshCount: 3,
    sourceFiles: ['scene.glb'],
    warnings: [],
    ...overrides,
  };
}

describe('excludeAnimatedMeshes', () => {
  it('should return no warnings when there are no animations', () => {
    const groups = [makeGroup()];
    const docs = [makeDoc()];
    const result = excludeAnimatedMeshes(groups, docs);
    expect(result.warnings).toHaveLength(0);
    expect(result.animatedMeshCount).toBe(0);
  });

  it('should warn when animation density is high (ratio >= 1)', () => {
    const groups = [makeGroup()];
    const docs = [
      makeDoc({
        animations: [
          { name: 'Walk', duration: 1, channels: 3 },
        ],
      }),
    ];
    const result = excludeAnimatedMeshes(groups, docs);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].severity).toBe('warn');
    expect(result.warnings[0].rule).toBe('animation-exclusion');
    expect(groups[0].warnings.length).toBeGreaterThan(0);
  });

  it('should add info when animations exist but ratio < 1', () => {
    const groups = [makeGroup()];
    const docs = [
      makeDoc({
        meshes: [
          { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
          { name: 'B', triangles: 100, vertices: 60, hasIndices: true },
          { name: 'C', triangles: 100, vertices: 60, hasIndices: true },
          { name: 'D', triangles: 100, vertices: 60, hasIndices: true },
        ],
        animations: [
          { name: 'Idle', duration: 1, channels: 1 },
        ],
      }),
    ];
    const result = excludeAnimatedMeshes(groups, docs);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].severity).toBe('info');
  });

  it('should estimate animated mesh count', () => {
    const docs = [
      makeDoc({
        animations: [
          { name: 'Walk', duration: 1, channels: 1 },
        ],
      }),
    ];
    const result = excludeAnimatedMeshes([], docs);
    expect(result.animatedMeshCount).toBe(1);
  });

  it('should add warnings to all groups', () => {
    const groups = [makeGroup(), makeGroup({ groupId: 'merge-1' })];
    const docs = [
      makeDoc({
        animations: [{ name: 'Walk', duration: 1, channels: 5 }],
      }),
    ];
    excludeAnimatedMeshes(groups, docs);
    expect(groups[0].warnings.length).toBeGreaterThan(0);
    expect(groups[1].warnings.length).toBeGreaterThan(0);
  });
});
