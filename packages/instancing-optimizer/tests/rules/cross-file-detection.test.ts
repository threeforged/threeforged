import { describe, it, expect } from 'vitest';
import { detectCrossFileOpportunities } from '../../src/rules/cross-file-detection.js';
import type { InstancingCandidate } from '../../src/types.js';

function makeCandidate(sourceFiles: string[]): InstancingCandidate {
  return {
    groupId: 'group-0',
    geometrySignature: '500v/200t/indexed',
    vertices: 500,
    triangles: 200,
    hasIndices: true,
    instanceCount: 6,
    drawCallsSaved: 5,
    trianglesSaved: 0,
    vramSavedBytes: 80_000,
    confidence: 'high',
    confidenceReasons: ['Identical geometry signature'],
    meshes: [],
    totalMeshCount: 6,
    sourceFiles,
  };
}

describe('detectCrossFileOpportunities', () => {
  it('should return no warnings for single-file candidates', () => {
    const candidates = [makeCandidate(['scene.glb'])];
    const warnings = detectCrossFileOpportunities(candidates);
    expect(warnings).toHaveLength(0);
  });

  it('should warn for multi-file candidates', () => {
    const candidates = [makeCandidate(['scene1.glb', 'scene2.glb'])];
    const warnings = detectCrossFileOpportunities(candidates);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
    expect(warnings[0].rule).toBe('cross-file-detection');
    expect(warnings[0].message).toContain('span 2 files');
  });

  it('should produce one warning per multi-file candidate', () => {
    const candidates = [
      makeCandidate(['a.glb', 'b.glb']),
      makeCandidate(['c.glb', 'd.glb', 'e.glb']),
    ];
    candidates[1].groupId = 'group-1';
    const warnings = detectCrossFileOpportunities(candidates);
    expect(warnings).toHaveLength(2);
  });

  it('should include file names in warning message', () => {
    const candidates = [makeCandidate(['forest.glb', 'city.glb'])];
    const warnings = detectCrossFileOpportunities(candidates);
    expect(warnings[0].message).toContain('forest.glb');
    expect(warnings[0].message).toContain('city.glb');
  });
});
