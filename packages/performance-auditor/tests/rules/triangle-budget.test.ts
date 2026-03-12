import { describe, it, expect } from 'vitest';
import { checkTriangleBudget } from '../../src/rules/triangle-budget.js';
import { DEFAULT_AUDITOR_CONFIG } from '../../src/config.js';
import type { ParsedDocument } from '@threeforged/core';

function makeMockDoc(triangles: number): ParsedDocument {
  return {
    filePath: '/test/scene.glb',
    format: 'glb',
    meshes: [{ name: 'Mesh', triangles, vertices: triangles, hasIndices: true }],
    materials: [],
    textures: [],
    animations: [],
    drawCalls: 1,
    fileSize: 1024,
  };
}

describe('checkTriangleBudget', () => {
  it('should return no warnings when well under budget', () => {
    const warnings = checkTriangleBudget(makeMockDoc(100_000), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should warn when >80% of budget', () => {
    // desktop budget is 2M, 80% = 1.6M
    const warnings = checkTriangleBudget(makeMockDoc(1_700_000), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
  });

  it('should error when exceeding budget', () => {
    const warnings = checkTriangleBudget(makeMockDoc(2_500_000), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('error');
  });

  it('should handle zero triangles', () => {
    const warnings = checkTriangleBudget(makeMockDoc(0), DEFAULT_AUDITOR_CONFIG);
    expect(warnings).toHaveLength(0);
  });

  it('should handle mobile profile with lower budget', () => {
    const config = { ...DEFAULT_AUDITOR_CONFIG, profile: 'mobile' as const };
    const warnings = checkTriangleBudget(makeMockDoc(600_000), config);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('error');
  });
});
