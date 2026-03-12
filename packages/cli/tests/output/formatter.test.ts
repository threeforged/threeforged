import { describe, it, expect } from 'vitest';
import { formatAssetReport } from '../../src/output/formatter.js';
import type { AssetReport } from '@threeforged/core';

describe('formatAssetReport', () => {
  it('should format a report as a readable string', () => {
    const report: AssetReport = {
      files: [
        {
          filePath: '/test/model.glb',
          format: 'glb',
          meshes: [{ name: 'Cube', triangles: 12, vertices: 24, hasIndices: true }],
          materials: [{ name: 'Material', type: 'PBR', properties: {}, textures: [] }],
          textures: [],
          animations: [],
          drawCalls: 1,
          fileSize: 1024,
        },
      ],
      warnings: [],
      metrics: {
        totalTriangles: 12,
        totalVertices: 24,
        totalMeshes: 1,
        totalMaterials: 1,
        totalTextures: 0,
        totalDrawCalls: 1,
        totalAnimations: 0,
        totalGpuMemoryBytes: 0,
      },
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    const output = formatAssetReport(report);
    expect(output).toContain('ThreeForged Asset Analysis Report');
    expect(output).toContain('12');
    expect(output).toContain('No warnings found');
  });

  it('should show warnings when present', () => {
    const report: AssetReport = {
      files: [],
      warnings: [
        { rule: 'high-poly', severity: 'warn', message: 'Mesh has 60k triangles' },
      ],
      metrics: {
        totalTriangles: 60000,
        totalVertices: 30000,
        totalMeshes: 1,
        totalMaterials: 0,
        totalTextures: 0,
        totalDrawCalls: 1,
        totalAnimations: 0,
        totalGpuMemoryBytes: 0,
      },
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    const output = formatAssetReport(report);
    expect(output).toContain('high-poly');
    expect(output).toContain('60k');
  });
});
