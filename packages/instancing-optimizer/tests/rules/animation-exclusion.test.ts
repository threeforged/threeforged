import { describe, it, expect } from 'vitest';
import { adjustForAnimations } from '../../src/rules/animation-exclusion.js';
import type { ParsedDocument } from '@threeforged/core';
import type { InstancingCandidate } from '../../src/types.js';

function makeCandidate(overrides: Partial<InstancingCandidate> = {}): InstancingCandidate {
  return {
    groupId: 'group-0',
    geometrySignature: '500v/200t/indexed',
    vertices: 500,
    triangles: 200,
    hasIndices: true,
    instanceCount: 5,
    drawCallsSaved: 0,
    trianglesSaved: 0,
    vramSavedBytes: 0,
    confidence: 'high',
    confidenceReasons: ['Identical geometry signature'],
    meshes: [],
    totalMeshCount: 5,
    sourceFiles: ['scene.glb'],
    ...overrides,
  };
}

function makeDoc(meshCount: number, animations: { channels: number }[] = []): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: Array.from({ length: meshCount }, (_, i) => ({
      name: `Mesh_${i}`,
      triangles: 200,
      vertices: 500,
      hasIndices: true,
    })),
    materials: [],
    textures: [],
    animations: animations.map((a, i) => ({
      name: `Anim_${i}`,
      duration: 2,
      channels: a.channels,
    })),
    drawCalls: meshCount,
    fileSize: 1024,
  };
}

describe('adjustForAnimations', () => {
  it('should not adjust confidence when no animations present', () => {
    const candidates = [makeCandidate()];
    const warnings = adjustForAnimations(candidates, [makeDoc(5)]);
    expect(candidates[0].confidence).toBe('high');
    expect(warnings).toHaveLength(0);
  });

  it('should set low confidence when channels >= meshes', () => {
    const candidates = [makeCandidate()];
    const doc = makeDoc(5, [{ channels: 5 }]);
    const warnings = adjustForAnimations(candidates, [doc]);
    expect(candidates[0].confidence).toBe('low');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
  });

  it('should set medium confidence when some animations present', () => {
    const candidates = [makeCandidate()];
    const doc = makeDoc(10, [{ channels: 3 }]);
    const warnings = adjustForAnimations(candidates, [doc]);
    expect(candidates[0].confidence).toBe('medium');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
  });

  it('should not upgrade confidence from low to medium', () => {
    const candidates = [makeCandidate({ confidence: 'low', confidenceReasons: ['test'] })];
    const doc = makeDoc(10, [{ channels: 3 }]);
    adjustForAnimations(candidates, [doc]);
    expect(candidates[0].confidence).toBe('low');
  });

  it('should add reason to confidenceReasons', () => {
    const candidates = [makeCandidate()];
    const doc = makeDoc(5, [{ channels: 5 }]);
    adjustForAnimations(candidates, [doc]);
    expect(candidates[0].confidenceReasons.length).toBeGreaterThan(1);
    expect(candidates[0].confidenceReasons.some((r) => r.includes('Animation'))).toBe(true);
  });
});
