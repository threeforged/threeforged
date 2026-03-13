import { describe, it, expect } from 'vitest';
import { groupByMaterial } from '../../src/rules/material-grouping.js';
import type { ParsedDocument } from '@threeforged/core';
import type { StaticOptimizerConfig } from '../../src/types.js';
import { DEFAULT_STATIC_CONFIG } from '../../src/config.js';

function makeConfig(overrides: Partial<StaticOptimizerConfig> = {}): StaticOptimizerConfig {
  return { ...DEFAULT_STATIC_CONFIG, ...overrides };
}

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

describe('groupByMaterial', () => {
  it('should group meshes sharing the same material', () => {
    const doc = makeDoc({
      meshes: [
        { name: 'Wall1', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'Wall2', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'Wall3', triangles: 100, vertices: 60, hasIndices: true },
      ],
      materials: [
        {
          name: 'WallMat',
          type: 'PBR',
          properties: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 },
          textures: [],
        },
        {
          name: 'WallMat',
          type: 'PBR',
          properties: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 },
          textures: [],
        },
        {
          name: 'WallMat',
          type: 'PBR',
          properties: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 },
          textures: [],
        },
      ],
    });

    const { groups } = groupByMaterial([doc], makeConfig());
    expect(groups.length).toBeGreaterThanOrEqual(1);
    expect(groups[0].meshCount).toBe(3);
    expect(groups[0].materialName).toBe('WallMat');
  });

  it('should not group meshes with different materials', () => {
    const doc = makeDoc({
      meshes: [
        { name: 'Wall', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'Floor', triangles: 100, vertices: 60, hasIndices: true },
      ],
      materials: [
        {
          name: 'WallMat',
          type: 'PBR',
          properties: { baseColorFactor: [1, 0, 0, 1], metallicFactor: 0, roughnessFactor: 1 },
          textures: [],
        },
        {
          name: 'FloorMat',
          type: 'PBR',
          properties: { baseColorFactor: [0, 1, 0, 1], metallicFactor: 0.5, roughnessFactor: 0.5 },
          textures: [],
        },
      ],
    });

    const { groups } = groupByMaterial([doc], makeConfig());
    // Each material only has 1 mesh, below minMeshesPerGroup of 2
    expect(groups).toHaveLength(0);
  });

  it('should respect minMeshesPerGroup', () => {
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'B', triangles: 100, vertices: 60, hasIndices: true },
      ],
      materials: [
        {
          name: 'Mat',
          type: 'PBR',
          properties: { baseColorFactor: [1, 1, 1, 1] },
          textures: [],
        },
        {
          name: 'Mat',
          type: 'PBR',
          properties: { baseColorFactor: [1, 1, 1, 1] },
          textures: [],
        },
      ],
    });

    // minMeshesPerGroup = 3 should filter out this group
    const { groups } = groupByMaterial([doc], makeConfig({ minMeshesPerGroup: 3 }));
    expect(groups).toHaveLength(0);

    // minMeshesPerGroup = 2 should keep it
    const { groups: groups2 } = groupByMaterial([doc], makeConfig({ minMeshesPerGroup: 2 }));
    expect(groups2).toHaveLength(1);
  });

  it('should cap groups at maxGroups', () => {
    // Create a doc with 5 different materials, each used by 2 meshes
    const meshes = [];
    const materials = [];
    for (let i = 0; i < 10; i++) {
      const matIdx = Math.floor(i / 2);
      meshes.push({ name: `Mesh${i}`, triangles: 100, vertices: 60, hasIndices: true });
      materials.push({
        name: `Mat${matIdx}`,
        type: 'PBR',
        properties: { baseColorFactor: [matIdx * 0.2, 0, 0, 1] },
        textures: [],
      });
    }

    const doc = makeDoc({ meshes, materials });
    const { groups } = groupByMaterial([doc], makeConfig({ maxGroups: 2 }));
    expect(groups.length).toBeLessThanOrEqual(2);
  });

  it('should cap entries per group at maxEntriesPerGroup', () => {
    const meshes = [];
    const materials = [];
    for (let i = 0; i < 10; i++) {
      meshes.push({ name: `Wall${i}`, triangles: 100, vertices: 60, hasIndices: true });
      materials.push({
        name: 'WallMat',
        type: 'PBR',
        properties: { baseColorFactor: [1, 1, 1, 1] },
        textures: [],
      });
    }

    const doc = makeDoc({ meshes, materials });
    const { groups } = groupByMaterial([doc], makeConfig({ maxEntriesPerGroup: 3 }));
    expect(groups[0].meshes.length).toBeLessThanOrEqual(3);
    expect(groups[0].totalMeshCount).toBe(10);
  });

  it('should sort groups by mesh count descending', () => {
    const meshes = [];
    const materials = [];
    // 5 meshes with MatA, 3 meshes with MatB
    for (let i = 0; i < 5; i++) {
      meshes.push({ name: `A${i}`, triangles: 100, vertices: 60, hasIndices: true });
      materials.push({
        name: 'MatA',
        type: 'PBR',
        properties: { baseColorFactor: [1, 0, 0, 1] },
        textures: [],
      });
    }
    for (let i = 0; i < 3; i++) {
      meshes.push({ name: `B${i}`, triangles: 100, vertices: 60, hasIndices: true });
      materials.push({
        name: 'MatB',
        type: 'PBR',
        properties: { baseColorFactor: [0, 1, 0, 1] },
        textures: [],
      });
    }

    const doc = makeDoc({ meshes, materials });
    const { groups } = groupByMaterial([doc], makeConfig());
    expect(groups.length).toBe(2);
    expect(groups[0].meshCount).toBeGreaterThanOrEqual(groups[1].meshCount);
  });

  it('should track source files correctly', () => {
    const doc1 = makeDoc({
      filePath: '/project/a.glb',
      meshes: [
        { name: 'Wall1', triangles: 100, vertices: 60, hasIndices: true },
      ],
      materials: [
        { name: 'WallMat', type: 'PBR', properties: { baseColorFactor: [1, 1, 1, 1] }, textures: [] },
      ],
    });
    const doc2 = makeDoc({
      filePath: '/project/b.glb',
      meshes: [
        { name: 'Wall2', triangles: 100, vertices: 60, hasIndices: true },
      ],
      materials: [
        { name: 'WallMat', type: 'PBR', properties: { baseColorFactor: [1, 1, 1, 1] }, textures: [] },
      ],
    });

    const { groups } = groupByMaterial([doc1, doc2], makeConfig());
    expect(groups).toHaveLength(1);
    expect(groups[0].sourceFiles).toContain('a.glb');
    expect(groups[0].sourceFiles).toContain('b.glb');
  });

  it('should compute totalVertices and totalTriangles', () => {
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'B', triangles: 200, vertices: 120, hasIndices: true },
      ],
      materials: [
        { name: 'Mat', type: 'PBR', properties: { baseColorFactor: [1, 1, 1, 1] }, textures: [] },
        { name: 'Mat', type: 'PBR', properties: { baseColorFactor: [1, 1, 1, 1] }, textures: [] },
      ],
    });

    const { groups } = groupByMaterial([doc], makeConfig());
    expect(groups[0].totalVertices).toBe(180);
    expect(groups[0].totalTriangles).toBe(300);
  });

  it('should differentiate materials by texture references', () => {
    const doc = makeDoc({
      meshes: [
        { name: 'A', triangles: 100, vertices: 60, hasIndices: true },
        { name: 'B', triangles: 100, vertices: 60, hasIndices: true },
      ],
      materials: [
        { name: 'Mat1', type: 'PBR', properties: { baseColorFactor: [1, 1, 1, 1] }, textures: ['diffuse.png'] },
        { name: 'Mat2', type: 'PBR', properties: { baseColorFactor: [1, 1, 1, 1] }, textures: ['normal.png'] },
      ],
    });

    const { groups } = groupByMaterial([doc], makeConfig());
    // Different textures = different material hashes = no grouping
    expect(groups).toHaveLength(0);
  });

  it('should handle empty documents', () => {
    const { groups } = groupByMaterial([], makeConfig());
    expect(groups).toHaveLength(0);
  });
});
