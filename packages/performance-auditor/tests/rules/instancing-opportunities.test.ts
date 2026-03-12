import { describe, it, expect } from 'vitest';
import { checkInstancingOpportunities } from '../../src/rules/instancing-opportunities.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeDocs(meshGroups: { count: number; vertices: number; triangles: number }[]): ParsedDocument[] {
  return meshGroups.map((group, gi) => ({
    filePath: `/test/scene_${gi}.glb`,
    format: 'glb' as const,
    meshes: Array.from({ length: group.count }, (_, i) => ({
      name: `Mesh_${gi}_${i}`,
      triangles: group.triangles,
      vertices: group.vertices,
      hasIndices: true,
    })),
    materials: [],
    textures: [],
    animations: [],
    drawCalls: group.count,
    fileSize: 1024,
  }));
}

describe('checkInstancingOpportunities', () => {
  it('should return no warnings for fewer than instancingMinCount matches', () => {
    // Only 2 meshes with same signature (default min is 3)
    const docs = makeDocs([{ count: 2, vertices: 100, triangles: 50 }]);
    const warnings = checkInstancingOpportunities(docs, DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should suggest instancing for 3+ matching meshes', () => {
    const docs = makeDocs([{ count: 3, vertices: 100, triangles: 50 }]);
    const warnings = checkInstancingOpportunities(docs, DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
    expect(warnings[0].message).toContain('InstancedMesh');
  });

  it('should warn for 10+ matching meshes', () => {
    const docs = makeDocs([{ count: 10, vertices: 100, triangles: 50 }]);
    const warnings = checkInstancingOpportunities(docs, DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
  });

  it('should detect instancing across multiple documents', () => {
    const docs = [
      ...makeDocs([{ count: 2, vertices: 200, triangles: 100 }]),
      ...makeDocs([{ count: 2, vertices: 200, triangles: 100 }]),
    ];
    const warnings = checkInstancingOpportunities(docs, DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('4 meshes');
  });

  it('should cap reported groups', () => {
    // Create 15 distinct groups of 3 meshes each
    const docs: ParsedDocument[] = [{
      filePath: '/test/scene.glb',
      format: 'glb',
      meshes: Array.from({ length: 45 }, (_, i) => ({
        name: `Mesh_${i}`,
        triangles: (i % 15) * 100 + 50,
        vertices: (i % 15) * 100 + 50,
        hasIndices: true,
      })),
      materials: [],
      textures: [],
      animations: [],
      drawCalls: 45,
      fileSize: 1024,
    }];
    const warnings = checkInstancingOpportunities(docs, DEFAULT_AUDITOR_CONFIG);
    expect(warnings.length).toBeLessThanOrEqual(10);
  });
});
