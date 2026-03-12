import { describe, it, expect } from 'vitest';
import { adjustForMaterials } from '../../src/rules/material-compatibility.js';
import { DEFAULT_OPTIMIZER_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';
import type { InstancingCandidate } from '../../src/types.js';

function makeCandidate(meshNames: string[]): InstancingCandidate {
  return {
    groupId: 'group-0',
    geometrySignature: '500v/200t/indexed',
    vertices: 500,
    triangles: 200,
    hasIndices: true,
    instanceCount: meshNames.length,
    drawCallsSaved: 0,
    trianglesSaved: 0,
    vramSavedBytes: 0,
    confidence: 'high',
    confidenceReasons: ['Identical geometry signature'],
    meshes: meshNames.map((name) => ({ name, file: 'scene.glb' })),
    totalMeshCount: meshNames.length,
    sourceFiles: ['scene.glb'],
  };
}

function makeDoc(meshCount: number, materialCount: number): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: Array.from({ length: meshCount }, (_, i) => ({
      name: `Mesh_${i}`,
      triangles: 200,
      vertices: 500,
      hasIndices: true,
    })),
    materials: Array.from({ length: materialCount }, (_, i) => ({
      name: `Mat_${i}`,
      type: 'Standard',
      properties: {},
      textures: [],
    })),
    textures: [],
    animations: [],
    drawCalls: meshCount,
    fileSize: 1024,
  };
}

describe('adjustForMaterials', () => {
  it('should not adjust confidence with low material-to-mesh ratio', () => {
    const candidates = [makeCandidate(['Tree_1', 'Tree_2', 'Tree_3'])];
    // 2 materials / 10 meshes = 0.2 (below 0.5 threshold)
    const doc = makeDoc(10, 2);
    const warnings = adjustForMaterials(candidates, [doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates[0].confidence).toBe('high');
    expect(warnings).toHaveLength(0);
  });

  it('should downgrade confidence with high material-to-mesh ratio and no name prefix', () => {
    const candidates = [makeCandidate(['Alpha', 'Bravo', 'Charlie'])];
    // 8 materials / 10 meshes = 0.8 (above 0.5 threshold)
    const doc = makeDoc(10, 8);
    const warnings = adjustForMaterials(candidates, [doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates[0].confidence).toBe('medium');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
  });

  it('should keep high confidence when name prefix matches despite high ratio', () => {
    const candidates = [makeCandidate(['Tree_1', 'Tree_2', 'Tree_3'])];
    const doc = makeDoc(10, 8);
    adjustForMaterials(candidates, [doc], DEFAULT_OPTIMIZER_CONFIG);
    // Common prefix "Tree" → confidence stays high
    expect(candidates[0].confidence).toBe('high');
  });

  it('should detect common prefix with dash separator', () => {
    const candidates = [makeCandidate(['lamp-01', 'lamp-02', 'lamp-03'])];
    const doc = makeDoc(10, 8);
    adjustForMaterials(candidates, [doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(candidates[0].confidence).toBe('high');
    expect(candidates[0].confidenceReasons.some((r) => r.includes('common prefix'))).toBe(true);
  });

  it('should handle empty documents gracefully', () => {
    const candidates = [makeCandidate(['A', 'B', 'C'])];
    const doc = makeDoc(0, 0);
    const warnings = adjustForMaterials(candidates, [doc], DEFAULT_OPTIMIZER_CONFIG);
    expect(warnings).toHaveLength(0);
  });
});
