import { describe, it, expect } from 'vitest';
import { groupByGeometry } from '../../src/rules/geometry-grouping.js';
import { DEFAULT_OPTIMIZER_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeDoc(meshes: { name: string; vertices: number; triangles: number; hasIndices: boolean }[], filePath = '/test/scene.glb'): ParsedDocument {
  return {
    filePath,
    format: 'glb',
    meshes,
    materials: [],
    textures: [],
    animations: [],
    drawCalls: meshes.length,
    fileSize: 1024,
  };
}

describe('groupByGeometry', () => {
  it('should group meshes with identical signatures', () => {
    const doc = makeDoc([
      { name: 'Tree_1', vertices: 500, triangles: 200, hasIndices: true },
      { name: 'Tree_2', vertices: 500, triangles: 200, hasIndices: true },
      { name: 'Tree_3', vertices: 500, triangles: 200, hasIndices: true },
    ]);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].instanceCount).toBe(3);
    expect(candidates[0].geometrySignature).toBe('500v/200t/indexed');
    expect(candidates[0].confidence).toBe('high');
  });

  it('should not group meshes below instancingMinCount', () => {
    const doc = makeDoc([
      { name: 'A', vertices: 500, triangles: 200, hasIndices: true },
      { name: 'B', vertices: 500, triangles: 200, hasIndices: true },
    ]);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(0);
  });

  it('should filter meshes below minTrianglesPerMesh', () => {
    const doc = makeDoc([
      { name: 'Tiny_1', vertices: 10, triangles: 5, hasIndices: true },
      { name: 'Tiny_2', vertices: 10, triangles: 5, hasIndices: true },
      { name: 'Tiny_3', vertices: 10, triangles: 5, hasIndices: true },
    ]);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(0);
  });

  it('should distinguish indexed vs unindexed geometry', () => {
    const doc = makeDoc([
      { name: 'A', vertices: 500, triangles: 200, hasIndices: true },
      { name: 'B', vertices: 500, triangles: 200, hasIndices: true },
      { name: 'C', vertices: 500, triangles: 200, hasIndices: true },
      { name: 'D', vertices: 500, triangles: 200, hasIndices: false },
      { name: 'E', vertices: 500, triangles: 200, hasIndices: false },
      { name: 'F', vertices: 500, triangles: 200, hasIndices: false },
    ]);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(2);
    const sigs = candidates.map((c) => c.geometrySignature).sort();
    expect(sigs).toEqual(['500v/200t/indexed', '500v/200t/unindexed']);
  });

  it('should sort by instance count (most first)', () => {
    const doc = makeDoc([
      // 3 of type A
      { name: 'A1', vertices: 100, triangles: 50, hasIndices: true },
      { name: 'A2', vertices: 100, triangles: 50, hasIndices: true },
      { name: 'A3', vertices: 100, triangles: 50, hasIndices: true },
      // 5 of type B
      { name: 'B1', vertices: 200, triangles: 100, hasIndices: true },
      { name: 'B2', vertices: 200, triangles: 100, hasIndices: true },
      { name: 'B3', vertices: 200, triangles: 100, hasIndices: true },
      { name: 'B4', vertices: 200, triangles: 100, hasIndices: true },
      { name: 'B5', vertices: 200, triangles: 100, hasIndices: true },
    ]);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(2);
    expect(candidates[0].instanceCount).toBe(5);
    expect(candidates[1].instanceCount).toBe(3);
  });

  it('should cap at maxGroups', () => {
    const meshes = [];
    // Create 25 distinct groups of 3 meshes each
    for (let g = 0; g < 25; g++) {
      for (let i = 0; i < 3; i++) {
        meshes.push({ name: `M_${g}_${i}`, vertices: (g + 1) * 100, triangles: (g + 1) * 50, hasIndices: true });
      }
    }
    const doc = makeDoc(meshes);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates.length).toBeLessThanOrEqual(DEFAULT_OPTIMIZER_CONFIG.maxGroups);
  });

  it('should cap meshes shown per group at maxEntriesPerGroup', () => {
    const meshes = Array.from({ length: 20 }, (_, i) => ({
      name: `Tree_${i}`,
      vertices: 500,
      triangles: 200,
      hasIndices: true,
    }));
    const doc = makeDoc(meshes);
    const candidates = groupByGeometry([doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].meshes.length).toBeLessThanOrEqual(DEFAULT_OPTIMIZER_CONFIG.maxEntriesPerGroup);
    expect(candidates[0].totalMeshCount).toBe(20);
  });

  it('should group across multiple documents', () => {
    const doc1 = makeDoc(
      [
        { name: 'Tree_1', vertices: 500, triangles: 200, hasIndices: true },
        { name: 'Tree_2', vertices: 500, triangles: 200, hasIndices: true },
      ],
      '/test/scene1.glb',
    );
    const doc2 = makeDoc(
      [
        { name: 'Tree_3', vertices: 500, triangles: 200, hasIndices: true },
      ],
      '/test/scene2.glb',
    );
    const candidates = groupByGeometry([doc1, doc2], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].instanceCount).toBe(3);
    expect(candidates[0].sourceFiles).toHaveLength(2);
  });
});
