import { describe, it, expect } from 'vitest';
import { buildLODReport } from '../../src/report/builder.js';
import { DEFAULT_LOD_CONFIG } from '../../src/config.js';
import type { LODFileResult } from '../../src/types.js';
import type { Warning } from '@threeforged/core';

function makeFileResult(overrides: Partial<LODFileResult> = {}): LODFileResult {
  return {
    file: '/test/project/model.glb',
    format: 'glb',
    originalTriangles: 1000,
    originalVertices: 500,
    levels: [
      {
        level: 0,
        targetRatio: 1.0,
        totalTriangles: 1000,
        totalVertices: 500,
        reductionPercent: 0,
        meshes: [{ name: 'mesh1', triangles: 600, vertices: 300 }, { name: 'mesh2', triangles: 400, vertices: 200 }],
      },
      {
        level: 1,
        targetRatio: 0.5,
        totalTriangles: 500,
        totalVertices: 250,
        reductionPercent: 50,
        meshes: [{ name: 'mesh1', triangles: 300, vertices: 150 }, { name: 'mesh2', triangles: 200, vertices: 100 }],
      },
    ],
    outputFiles: [],
    ...overrides,
  };
}

describe('buildLODReport', () => {
  it('should build a report with correct structure', () => {
    const report = buildLODReport([makeFileResult()], [], DEFAULT_LOD_CONFIG, false);

    expect(report.files).toHaveLength(1);
    expect(report.warnings).toHaveLength(0);
    expect(report.config.levels).toBe(3);
    expect(report.config.ratio).toBe(0.5);
    expect(report.writeMode).toBe(false);
    expect(report.timestamp).toBeTruthy();
  });

  it('should compute correct metrics', () => {
    const report = buildLODReport([makeFileResult()], [], DEFAULT_LOD_CONFIG, false);

    expect(report.metrics.totalTriangles).toBe(1000);
    expect(report.metrics.totalVertices).toBe(500);
    expect(report.metrics.totalMeshes).toBe(2);
    expect(report.metrics.totalFilesProcessed).toBe(1);
    expect(report.metrics.lodLevelsGenerated).toBe(3);
    expect(report.metrics.maxReductionPercent).toBe(50);
    expect(report.metrics.hasAnimations).toBe(false);
  });

  it('should compute metrics across multiple files', () => {
    const file1 = makeFileResult({ originalTriangles: 1000, originalVertices: 500 });
    const file2 = makeFileResult({
      file: '/test/project/model2.glb',
      originalTriangles: 2000,
      originalVertices: 1000,
    });

    const report = buildLODReport([file1, file2], [], DEFAULT_LOD_CONFIG, false);

    expect(report.metrics.totalTriangles).toBe(3000);
    expect(report.metrics.totalVertices).toBe(1500);
    expect(report.metrics.totalFilesProcessed).toBe(2);
  });

  it('should sanitize file paths to be relative', () => {
    const report = buildLODReport([makeFileResult()], [], DEFAULT_LOD_CONFIG, false);

    // Should not start with /
    expect(report.files[0].file).not.toMatch(/^\//);
    expect(report.files[0].file).not.toMatch(/^[A-Z]:\\/);
  });

  it('should include ISO timestamp', () => {
    const report = buildLODReport([], [], DEFAULT_LOD_CONFIG, false);
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should handle empty inputs', () => {
    const report = buildLODReport([], [], DEFAULT_LOD_CONFIG, false);

    expect(report.files).toHaveLength(0);
    expect(report.metrics.totalTriangles).toBe(0);
    expect(report.metrics.totalVertices).toBe(0);
    expect(report.metrics.totalFilesProcessed).toBe(0);
    expect(report.metrics.totalOutputFiles).toBe(0);
  });

  it('should count output files', () => {
    const fileResult = makeFileResult({
      outputFiles: ['/test/project/model_lod1.glb', '/test/project/model_lod2.glb'],
    });

    const report = buildLODReport([fileResult], [], { ...DEFAULT_LOD_CONFIG, write: true }, false);
    expect(report.metrics.totalOutputFiles).toBe(2);
    expect(report.writeMode).toBe(true);
  });

  it('should include warnings', () => {
    const warnings: Warning[] = [
      { rule: 'animation-check', severity: 'warn', message: 'test warning' },
    ];

    const report = buildLODReport([], warnings, DEFAULT_LOD_CONFIG, true);
    expect(report.warnings).toHaveLength(1);
    expect(report.metrics.hasAnimations).toBe(true);
  });

  it('should guard against NaN reduction percent', () => {
    const fileResult = makeFileResult({
      levels: [
        {
          level: 0,
          targetRatio: 1.0,
          totalTriangles: 0,
          totalVertices: 0,
          reductionPercent: NaN,
          meshes: [],
        },
      ],
    });

    const report = buildLODReport([fileResult], [], DEFAULT_LOD_CONFIG, false);
    expect(report.files[0].levels[0].reductionPercent).toBe(0);
  });
});
