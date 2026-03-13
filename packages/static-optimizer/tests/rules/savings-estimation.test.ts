import { describe, it, expect } from 'vitest';
import { estimateSavings } from '../../src/rules/savings-estimation.js';
import type { StaticMergeGroup } from '../../src/types.js';

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

describe('estimateSavings', () => {
  it('should compute draw calls saved as meshCount - 1', () => {
    const group = makeGroup({ meshCount: 5 });
    estimateSavings([group], 10);
    expect(group.drawCallsSaved).toBe(4);
  });

  it('should set VRAM overhead per group', () => {
    const group = makeGroup();
    estimateSavings([group], 10);
    expect(group.vramOverheadBytes).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(group.vramOverheadBytes)).toBe(true);
  });

  it('should emit error severity when reduction >= 50%', () => {
    const group = makeGroup({ meshCount: 6 }); // saves 5 out of 10
    const warnings = estimateSavings([group], 10);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('error');
    expect(warnings[0].rule).toBe('savings-estimation');
  });

  it('should emit warn severity when reduction >= 20% but < 50%', () => {
    const group = makeGroup({ meshCount: 4 }); // saves 3 out of 10 = 30%
    const warnings = estimateSavings([group], 10);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
  });

  it('should emit info severity when reduction >= 5% but < 20%', () => {
    const group = makeGroup({ meshCount: 2 }); // saves 1 out of 10 = 10%
    const warnings = estimateSavings([group], 10);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
  });

  it('should emit no warnings when reduction < 5%', () => {
    const group = makeGroup({ meshCount: 2 }); // saves 1 out of 100 = 1%
    const warnings = estimateSavings([group], 100);
    expect(warnings).toHaveLength(0);
  });

  it('should handle zero total draw calls', () => {
    const group = makeGroup();
    const warnings = estimateSavings([group], 0);
    expect(warnings).toHaveLength(0);
    expect(group.drawCallsSaved).toBe(2);
  });

  it('should accumulate savings across multiple groups', () => {
    const g1 = makeGroup({ meshCount: 3 }); // saves 2
    const g2 = makeGroup({ groupId: 'merge-1', meshCount: 4 }); // saves 3
    // Total saves 5 out of 10 = 50%
    const warnings = estimateSavings([g1, g2], 10);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('error');
  });
});
