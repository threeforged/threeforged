import { describe, it, expect } from 'vitest';
import { buildInstancingReport } from '../../src/report/builder.js';
import type { ParsedDocument } from '@threeforged/core';
import type { InstancingCandidate } from '../../src/types.js';

function makeMockDoc(): ParsedDocument {
  return {
    filePath: '/test/project/scene.glb',
    format: 'glb',
    meshes: [
      { name: 'Mesh1', triangles: 500, vertices: 300, hasIndices: true },
      { name: 'Mesh2', triangles: 1000, vertices: 600, hasIndices: false },
    ],
    materials: [
      { name: 'Mat1', type: 'Standard', properties: {}, textures: [] },
    ],
    textures: [
      { name: 'Tex1', width: 1024, height: 1024, format: 'png', gpuMemoryBytes: 4_194_304 },
    ],
    animations: [
      { name: 'Walk', duration: 2, channels: 3 },
    ],
    drawCalls: 2,
    fileSize: 50_000,
  };
}

function makeCandidate(): InstancingCandidate {
  return {
    groupId: 'group-0',
    geometrySignature: '300v/500t/indexed',
    vertices: 300,
    triangles: 500,
    hasIndices: true,
    instanceCount: 4,
    drawCallsSaved: 3,
    trianglesSaved: 0,
    vramSavedBytes: 28_800,
    confidence: 'high',
    confidenceReasons: ['Identical geometry signature'],
    meshes: [{ name: 'Mesh1', file: 'scene.glb' }],
    totalMeshCount: 4,
    sourceFiles: ['scene.glb'],
  };
}

describe('buildInstancingReport', () => {
  it('should compute correct base metrics', () => {
    const doc = makeMockDoc();
    const report = buildInstancingReport([doc], [], []);

    expect(report.metrics.totalMeshes).toBe(2);
    expect(report.metrics.totalTriangles).toBe(1500);
    expect(report.metrics.totalVertices).toBe(900);
    expect(report.metrics.totalMaterials).toBe(1);
    expect(report.metrics.totalTextures).toBe(1);
    expect(report.metrics.totalDrawCalls).toBe(2);
    expect(report.metrics.totalAnimations).toBe(1);
    expect(report.metrics.totalGpuMemoryBytes).toBe(4_194_304 + 900 * 32);
  });

  it('should include instancing-specific metrics', () => {
    const candidate = makeCandidate();
    const report = buildInstancingReport([makeMockDoc()], [], [candidate]);

    expect(report.metrics.candidateGroups).toBe(1);
    expect(report.metrics.totalInstancingCandidates).toBe(4);
    expect(report.metrics.totalDrawCallsSaved).toBe(3);
    expect(report.metrics.totalVramSavedBytes).toBe(28_800);
    expect(report.metrics.hasAnimations).toBe(true);
  });

  it('should compute draw call reduction percent', () => {
    const candidate = makeCandidate();
    const report = buildInstancingReport([makeMockDoc()], [], [candidate]);
    // 3 saved / 2 total = 150%
    expect(report.metrics.drawCallReductionPercent).toBe(150);
  });

  it('should include ISO timestamp', () => {
    const report = buildInstancingReport([], [], []);
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should relativize file paths', () => {
    const report = buildInstancingReport([makeMockDoc()], [], []);
    for (const file of report.files) {
      expect(file.filePath).not.toMatch(/^\/test\//);
    }
  });

  it('should handle empty inputs', () => {
    const report = buildInstancingReport([], [], []);
    expect(report.files).toHaveLength(0);
    expect(report.candidates).toHaveLength(0);
    expect(report.warnings).toHaveLength(0);
    expect(report.metrics.totalMeshes).toBe(0);
    expect(report.metrics.candidateGroups).toBe(0);
    expect(report.metrics.drawCallReductionPercent).toBe(0);
    expect(report.metrics.geometryReuseRatio).toBe(0);
  });

  it('should compute geometry reuse ratio', () => {
    const doc = makeMockDoc();
    const report = buildInstancingReport([doc], [], []);
    // 2 meshes, 2 unique signatures → ratio = 1.0
    expect(report.metrics.uniqueGeometryCount).toBe(2);
    expect(report.metrics.geometryReuseRatio).toBe(1);
  });
});
