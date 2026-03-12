import { describe, it, expect } from 'vitest';
import { computePerformanceScore, computeGrade } from '../../src/rules/performance-score.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeMockDoc(opts: {
  drawCalls?: number;
  triangles?: number;
  vertices?: number;
  materials?: number;
  hasIndices?: boolean;
  gpuMemoryBytes?: number;
}): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: [{
      name: 'Mesh',
      triangles: opts.triangles ?? 100,
      vertices: opts.vertices ?? 100,
      hasIndices: opts.hasIndices ?? true,
    }],
    materials: Array.from({ length: opts.materials ?? 1 }, (_, i) => ({
      name: `Mat_${i}`,
      type: 'MeshStandard',
      properties: {},
      textures: [],
    })),
    textures: opts.gpuMemoryBytes != null
      ? [{ name: 'Tex', width: 1024, height: 1024, format: 'png', gpuMemoryBytes: opts.gpuMemoryBytes }]
      : [],
    animations: [],
    drawCalls: opts.drawCalls ?? 1,
    fileSize: 1024,
  };
}

describe('computeGrade', () => {
  it('should assign correct letter grades', () => {
    expect(computeGrade(95)).toBe('A');
    expect(computeGrade(90)).toBe('A');
    expect(computeGrade(85)).toBe('B');
    expect(computeGrade(80)).toBe('B');
    expect(computeGrade(75)).toBe('C');
    expect(computeGrade(70)).toBe('C');
    expect(computeGrade(50)).toBe('D');
    expect(computeGrade(40)).toBe('D');
    expect(computeGrade(39)).toBe('F');
    expect(computeGrade(0)).toBe('F');
  });
});

describe('computePerformanceScore', () => {
  it('should give high score for minimal scene', () => {
    const { score, grade } = computePerformanceScore(
      [makeMockDoc({})],
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(score).toBeGreaterThanOrEqual(90);
    expect(grade).toBe('A');
  });

  it('should give low score for over-budget scene', () => {
    const { score, grade } = computePerformanceScore(
      [makeMockDoc({
        drawCalls: 500,
        triangles: 3_000_000,
        vertices: 3_000_000,
        materials: 60,
        gpuMemoryBytes: 600 * 1024 * 1024,
      })],
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(score).toBeLessThan(40);
    expect(grade).toBe('F');
  });

  it('should give medium score for mixed scene', () => {
    const { score } = computePerformanceScore(
      [makeMockDoc({
        drawCalls: 200,
        triangles: 1_000_000,
        vertices: 1_000_000,
        materials: 15,
      })],
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThan(90);
  });

  it('should return info warning for good score', () => {
    const { warnings } = computePerformanceScore(
      [makeMockDoc({})],
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
  });

  it('should return error warning for bad score', () => {
    const { warnings } = computePerformanceScore(
      [makeMockDoc({
        drawCalls: 500,
        triangles: 3_000_000,
        vertices: 3_000_000,
        materials: 60,
        gpuMemoryBytes: 600 * 1024 * 1024,
      })],
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings[0].severity).toBe('error');
  });

  it('should penalize unindexed meshes', () => {
    const indexedResult = computePerformanceScore(
      [makeMockDoc({ hasIndices: true })],
      DEFAULT_AUDITOR_CONFIG,
    );
    const unindexedResult = computePerformanceScore(
      [makeMockDoc({ hasIndices: false })],
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(indexedResult.score).toBeGreaterThan(unindexedResult.score);
  });
});
