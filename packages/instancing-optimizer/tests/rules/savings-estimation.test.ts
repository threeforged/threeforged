import { describe, it, expect } from 'vitest';
import { estimateSavings } from '../../src/rules/savings-estimation.js';
import type { InstancingCandidate } from '../../src/types.js';

function makeCandidate(instanceCount: number, vertices: number): InstancingCandidate {
  return {
    groupId: 'group-0',
    geometrySignature: `${vertices}v/100t/indexed`,
    vertices,
    triangles: 100,
    hasIndices: true,
    instanceCount,
    drawCallsSaved: 0,
    trianglesSaved: 0,
    vramSavedBytes: 0,
    confidence: 'high',
    confidenceReasons: ['Identical geometry signature'],
    meshes: [],
    totalMeshCount: instanceCount,
    sourceFiles: ['scene.glb'],
  };
}

describe('estimateSavings', () => {
  it('should calculate correct draw calls saved', () => {
    const candidates = [makeCandidate(5, 500)];
    estimateSavings(candidates, 10);
    expect(candidates[0].drawCallsSaved).toBe(4);
  });

  it('should set trianglesSaved to 0', () => {
    const candidates = [makeCandidate(5, 500)];
    estimateSavings(candidates, 10);
    expect(candidates[0].trianglesSaved).toBe(0);
  });

  it('should calculate correct VRAM savings', () => {
    const candidates = [makeCandidate(5, 500)];
    estimateSavings(candidates, 10);
    // (5 - 1) * 500 * 32 = 64,000 bytes
    expect(candidates[0].vramSavedBytes).toBe(64_000);
  });

  it('should return error severity for >= 50% draw call reduction', () => {
    const candidates = [makeCandidate(11, 500)];
    const warnings = estimateSavings(candidates, 20);
    // 10 saved / 20 total = 50%
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('error');
  });

  it('should return warn severity for >= 20% draw call reduction', () => {
    const candidates = [makeCandidate(5, 500)];
    const warnings = estimateSavings(candidates, 20);
    // 4 saved / 20 total = 20%
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
  });

  it('should return info severity for >= 5% draw call reduction', () => {
    const candidates = [makeCandidate(3, 500)];
    const warnings = estimateSavings(candidates, 40);
    // 2 saved / 40 total = 5%
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
  });

  it('should return no warnings for < 5% draw call reduction', () => {
    const candidates = [makeCandidate(3, 500)];
    const warnings = estimateSavings(candidates, 100);
    // 2 saved / 100 total = 2%
    expect(warnings).toHaveLength(0);
  });

  it('should handle zero total draw calls without warnings', () => {
    const candidates = [makeCandidate(5, 500)];
    const warnings = estimateSavings(candidates, 0);
    expect(warnings).toHaveLength(0);
    expect(candidates[0].drawCallsSaved).toBe(4);
  });
});
