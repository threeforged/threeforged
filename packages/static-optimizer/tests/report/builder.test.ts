import { describe, it, expect } from 'vitest';
import { buildStaticReport } from '../../src/report/builder.js';
import type { ParsedDocument, Warning } from '@threeforged/core';
import type { StaticMergeGroup } from '../../src/types.js';

function makeDoc(overrides: Partial<ParsedDocument> = {}): ParsedDocument {
  return {
    filePath: '/project/scene.glb',
    format: 'glb',
    meshes: [
      { name: 'Mesh1', triangles: 100, vertices: 60, hasIndices: true },
      { name: 'Mesh2', triangles: 200, vertices: 120, hasIndices: true },
    ],
    materials: [
      { name: 'Mat1', type: 'PBR', properties: {}, textures: [] },
    ],
    textures: [
      { name: 'Tex1', width: 512, height: 512, format: 'png', gpuMemoryBytes: 1048576 },
    ],
    animations: [],
    drawCalls: 2,
    fileSize: 1024,
    ...overrides,
  };
}

function makeGroup(overrides: Partial<StaticMergeGroup> = {}): StaticMergeGroup {
  return {
    groupId: 'merge-0',
    materialSignature: 'PBR|bc:1.000,1.000,1.000,1.000',
    materialName: 'Mat1',
    meshCount: 3,
    totalVertices: 180,
    totalTriangles: 300,
    drawCallsSaved: 2,
    vramOverheadBytes: 256,
    exceedsIndexLimit: false,
    meshes: [
      { name: 'Mesh1', file: 'scene.glb', vertices: 60, triangles: 100 },
      { name: 'Mesh2', file: 'scene.glb', vertices: 60, triangles: 100 },
      { name: 'Mesh3', file: 'scene.glb', vertices: 60, triangles: 100 },
    ],
    totalMeshCount: 3,
    sourceFiles: ['scene.glb'],
    warnings: [],
    ...overrides,
  };
}

describe('buildStaticReport', () => {
  it('should build a report with correct structure', () => {
    const report = buildStaticReport([makeDoc()], [], [makeGroup()], 0);
    expect(report).toHaveProperty('files');
    expect(report).toHaveProperty('warnings');
    expect(report).toHaveProperty('metrics');
    expect(report).toHaveProperty('groups');
    expect(report).toHaveProperty('timestamp');
  });

  it('should compute base metrics from documents', () => {
    const report = buildStaticReport([makeDoc()], [], [], 0);
    expect(report.metrics.totalMeshes).toBe(2);
    expect(report.metrics.totalTriangles).toBe(300);
    expect(report.metrics.totalVertices).toBe(180);
    expect(report.metrics.totalMaterials).toBe(1);
    expect(report.metrics.totalTextures).toBe(1);
    expect(report.metrics.totalDrawCalls).toBe(2);
    expect(report.metrics.totalAnimations).toBe(0);
  });

  it('should compute GPU memory including geometry VRAM', () => {
    const report = buildStaticReport([makeDoc()], [], [], 0);
    // Texture VRAM (1048576) + geometry VRAM (180 vertices * 32 bytes)
    expect(report.metrics.totalGpuMemoryBytes).toBe(1048576 + 180 * 32);
  });

  it('should compute static-specific metrics', () => {
    const group = makeGroup();
    const report = buildStaticReport([makeDoc()], [], [group], 0);
    expect(report.metrics.mergeGroups).toBe(1);
    expect(report.metrics.totalMergeableMeshes).toBe(3);
    expect(report.metrics.totalDrawCallsSaved).toBe(2);
    expect(report.metrics.totalMergedVertices).toBe(180);
    expect(report.metrics.totalMergedTriangles).toBe(300);
  });

  it('should compute draw call reduction percent', () => {
    const group = makeGroup({ drawCallsSaved: 1 });
    const report = buildStaticReport([makeDoc()], [], [group], 0);
    expect(report.metrics.drawCallReductionPercent).toBe(50);
  });

  it('should handle zero draw calls without NaN', () => {
    const doc = makeDoc({ drawCalls: 0 });
    const report = buildStaticReport([doc], [], [], 0);
    expect(report.metrics.drawCallReductionPercent).toBe(0);
    expect(Number.isFinite(report.metrics.drawCallReductionPercent)).toBe(true);
  });

  it('should track animation counts', () => {
    const report = buildStaticReport([makeDoc()], [], [], 5);
    expect(report.metrics.hasAnimations).toBe(false);
    expect(report.metrics.animatedMeshCount).toBe(5);
    expect(report.metrics.staticMeshCount).toBe(0);
  });

  it('should compute staticMeshCount correctly', () => {
    const report = buildStaticReport([makeDoc()], [], [], 1);
    expect(report.metrics.staticMeshCount).toBe(1); // 2 total - 1 animated
    expect(report.metrics.animatedMeshCount).toBe(1);
  });

  it('should sanitize file paths relative to cwd', () => {
    const report = buildStaticReport([makeDoc()], [], [], 0);
    for (const file of report.files) {
      expect(file.filePath).not.toMatch(/^\//);
    }
  });

  it('should include warnings in report', () => {
    const warnings: Warning[] = [
      { rule: 'test', severity: 'warn', message: 'test warning' },
    ];
    const report = buildStaticReport([makeDoc()], warnings, [], 0);
    expect(report.warnings).toHaveLength(1);
    expect(report.warnings[0].rule).toBe('test');
  });

  it('should set timestamp', () => {
    const report = buildStaticReport([], [], [], 0);
    expect(report.timestamp).toBeDefined();
    expect(() => new Date(report.timestamp)).not.toThrow();
  });

  it('should handle empty inputs', () => {
    const report = buildStaticReport([], [], [], 0);
    expect(report.metrics.totalMeshes).toBe(0);
    expect(report.metrics.mergeGroups).toBe(0);
    expect(report.metrics.drawCallReductionPercent).toBe(0);
    expect(report.groups).toHaveLength(0);
  });

  it('should handle multiple documents', () => {
    const doc1 = makeDoc({ filePath: '/project/a.glb', drawCalls: 3 });
    const doc2 = makeDoc({ filePath: '/project/b.glb', drawCalls: 5 });
    const report = buildStaticReport([doc1, doc2], [], [], 0);
    expect(report.metrics.totalMeshes).toBe(4);
    expect(report.metrics.totalDrawCalls).toBe(8);
  });

  it('should default writeMode to false', () => {
    const report = buildStaticReport([], [], [], 0);
    expect(report.writeMode).toBe(false);
    expect(report.fileResults).toHaveLength(0);
  });

  it('should include writeMode and fileResults when provided', () => {
    const fileResults = [
      {
        file: '/project/scene.glb',
        format: 'glb',
        originalMeshCount: 10,
        mergedMeshCount: 3,
        originalDrawCalls: 10,
        mergedDrawCalls: 3,
        outputFile: '/project/scene_merged.glb',
      },
    ];
    const report = buildStaticReport([], [], [], 0, true, fileResults);
    expect(report.writeMode).toBe(true);
    expect(report.fileResults).toHaveLength(1);
    expect(report.fileResults[0].originalMeshCount).toBe(10);
    expect(report.fileResults[0].mergedMeshCount).toBe(3);
  });
});
