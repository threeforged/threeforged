import { describe, it, expect } from 'vitest';
import { checkVertexBudget } from '../../src/rules/vertex-budget.js';
import type { StaticMergeGroup } from '../../src/types.js';
import { DEFAULT_STATIC_CONFIG } from '../../src/config.js';

function makeGroup(overrides: Partial<StaticMergeGroup> = {}): StaticMergeGroup {
  return {
    groupId: 'merge-0',
    materialSignature: 'PBR',
    materialName: 'Mat1',
    meshCount: 3,
    totalVertices: 180,
    totalTriangles: 300,
    drawCallsSaved: 2,
    vramOverheadBytes: 0,
    exceedsIndexLimit: false,
    meshes: [],
    totalMeshCount: 3,
    sourceFiles: ['scene.glb'],
    warnings: [],
    ...overrides,
  };
}

describe('checkVertexBudget', () => {
  it('should not warn when vertices are within limit', () => {
    const group = makeGroup({ totalVertices: 1000 });
    const warnings = checkVertexBudget([group], DEFAULT_STATIC_CONFIG);
    expect(warnings).toHaveLength(0);
    expect(group.exceedsIndexLimit).toBe(false);
  });

  it('should warn when vertices exceed default 65535 limit', () => {
    const group = makeGroup({ totalVertices: 70000 });
    const warnings = checkVertexBudget([group], DEFAULT_STATIC_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('vertex-budget');
    expect(warnings[0].severity).toBe('warn');
    expect(group.exceedsIndexLimit).toBe(true);
  });

  it('should respect custom maxMergedVertices', () => {
    const group = makeGroup({ totalVertices: 5000 });
    const config = { ...DEFAULT_STATIC_CONFIG, maxMergedVertices: 4000 };
    const warnings = checkVertexBudget([group], config);
    expect(warnings).toHaveLength(1);
    expect(group.exceedsIndexLimit).toBe(true);
  });

  it('should not flag groups at exactly the limit', () => {
    const group = makeGroup({ totalVertices: 65535 });
    const warnings = checkVertexBudget([group], DEFAULT_STATIC_CONFIG);
    expect(warnings).toHaveLength(0);
    expect(group.exceedsIndexLimit).toBe(false);
  });

  it('should add warnings to group.warnings', () => {
    const group = makeGroup({ totalVertices: 70000 });
    checkVertexBudget([group], DEFAULT_STATIC_CONFIG);
    expect(group.warnings.length).toBeGreaterThan(0);
    expect(group.warnings[0]).toContain('vertex');
  });

  it('should check each group independently', () => {
    const g1 = makeGroup({ groupId: 'merge-0', totalVertices: 1000 });
    const g2 = makeGroup({ groupId: 'merge-1', totalVertices: 70000 });
    const warnings = checkVertexBudget([g1, g2], DEFAULT_STATIC_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(g1.exceedsIndexLimit).toBe(false);
    expect(g2.exceedsIndexLimit).toBe(true);
  });

  it('should handle empty groups', () => {
    const warnings = checkVertexBudget([], DEFAULT_STATIC_CONFIG);
    expect(warnings).toHaveLength(0);
  });
});
