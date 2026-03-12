import { describe, it, expect } from 'vitest';
import { checkGeometryComplexity } from '../../src/rules/geometry-complexity.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeMockDoc(opts: {
  triangles?: number;
  vertices?: number;
  hasIndices?: boolean;
}): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: [{
      name: 'TestMesh',
      triangles: opts.triangles ?? 1000,
      vertices: opts.vertices ?? 1000,
      hasIndices: opts.hasIndices ?? true,
    }],
    materials: [],
    textures: [],
    animations: [],
    drawCalls: 1,
    fileSize: 1024,
  };
}

describe('checkGeometryComplexity', () => {
  it('should return no warnings for simple geometry', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ triangles: 100, vertices: 100 }),
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings).toHaveLength(0);
  });

  it('should warn for dense geometry (ratio > 1.5)', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ triangles: 200, vertices: 100 }),
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings.some((w) => w.severity === 'warn' && w.message.includes('dense'))).toBe(true);
  });

  it('should error for very dense geometry (ratio > 3)', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ triangles: 400, vertices: 100 }),
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings.some((w) => w.severity === 'error' && w.message.includes('very dense'))).toBe(true);
  });

  it('should warn for unindexed geometry', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ hasIndices: false }),
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings.some((w) => w.message.includes('unindexed'))).toBe(true);
  });

  it('should warn for vertex-heavy meshes', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ vertices: 600_000, triangles: 200_000 }),
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings.some((w) => w.severity === 'warn' && w.message.includes('vertices'))).toBe(true);
  });

  it('should error for >1M vertex meshes', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ vertices: 1_500_000, triangles: 500_000 }),
      DEFAULT_AUDITOR_CONFIG,
    );
    expect(warnings.some((w) => w.severity === 'error' && w.message.includes('>1M'))).toBe(true);
  });

  it('should handle zero vertices without division error', () => {
    const warnings = checkGeometryComplexity(
      makeMockDoc({ vertices: 0, triangles: 0 }),
      DEFAULT_AUDITOR_CONFIG,
    );
    // Should not throw
    expect(warnings).toBeDefined();
  });
});
