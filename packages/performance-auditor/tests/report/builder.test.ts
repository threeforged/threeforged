import { describe, it, expect } from 'vitest';
import { buildAuditReport } from '../../src/report/builder.js';
import type { ParsedDocument, Warning } from '@threeforged/core';

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

describe('buildAuditReport', () => {
  it('should compute correct metrics', () => {
    const doc = makeMockDoc();
    const warnings: Warning[] = [];
    const report = buildAuditReport([doc], warnings, 'desktop', 85, 'B');

    expect(report.metrics.totalMeshes).toBe(2);
    expect(report.metrics.totalTriangles).toBe(1500);
    expect(report.metrics.totalVertices).toBe(900);
    expect(report.metrics.totalMaterials).toBe(1);
    expect(report.metrics.totalTextures).toBe(1);
    expect(report.metrics.totalDrawCalls).toBe(2);
    expect(report.metrics.totalAnimations).toBe(1);
    // GPU memory = texture (4MB) + geometry (900 vertices * 32 bytes)
    expect(report.metrics.totalGpuMemoryBytes).toBe(4_194_304 + 900 * 32);
  });

  it('should include score, grade, and profile', () => {
    const report = buildAuditReport([makeMockDoc()], [], 'mobile', 72, 'C');
    expect(report.score).toBe(72);
    expect(report.grade).toBe('C');
    expect(report.profile).toBe('mobile');
  });

  it('should include ISO timestamp', () => {
    const report = buildAuditReport([], [], 'desktop', 100, 'A');
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should relativize file paths', () => {
    const report = buildAuditReport([makeMockDoc()], [], 'desktop', 85, 'B');
    // Path should not be absolute (unless cwd happens to match)
    for (const file of report.files) {
      expect(file.filePath).not.toMatch(/^\/test\//);
    }
  });

  it('should handle empty documents', () => {
    const report = buildAuditReport([], [], 'desktop', 100, 'A');
    expect(report.files).toHaveLength(0);
    expect(report.metrics.totalMeshes).toBe(0);
    expect(report.metrics.totalTriangles).toBe(0);
  });
});
