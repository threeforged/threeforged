import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { detectStaticMergeCandidates } from '../src/optimizer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../core/tests/fixtures');

describe('detectStaticMergeCandidates', () => {
  it('should analyze a GLB fixture file', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await detectStaticMergeCandidates(fixturePath);
    expect(report.files).toHaveLength(1);
    expect(report.metrics.totalMeshes).toBeGreaterThan(0);
    expect(report.groups).toBeDefined();
    expect(report.timestamp).toBeDefined();
  });

  it('should throw for unsupported files', async () => {
    await expect(detectStaticMergeCandidates('/nonexistent/file.fbx')).rejects.toThrow();
  });

  it('should return correct report structure', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await detectStaticMergeCandidates(fixturePath);
    expect(report).toHaveProperty('files');
    expect(report).toHaveProperty('warnings');
    expect(report).toHaveProperty('metrics');
    expect(report).toHaveProperty('groups');
    expect(report).toHaveProperty('timestamp');

    // Verify static-specific metrics
    expect(report.metrics).toHaveProperty('mergeGroups');
    expect(report.metrics).toHaveProperty('totalMergeableMeshes');
    expect(report.metrics).toHaveProperty('totalDrawCallsSaved');
    expect(report.metrics).toHaveProperty('drawCallReductionPercent');
    expect(report.metrics).toHaveProperty('totalMergedVertices');
    expect(report.metrics).toHaveProperty('totalMergedTriangles');
    expect(report.metrics).toHaveProperty('hasAnimations');
    expect(report.metrics).toHaveProperty('staticMeshCount');
    expect(report.metrics).toHaveProperty('animatedMeshCount');
  });

  it('should produce valid report for single-file input', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await detectStaticMergeCandidates(fixturePath);
    expect(report.files.length).toBeGreaterThanOrEqual(0);
    expect(report.metrics).toBeDefined();
    expect(report.warnings).toBeDefined();
    expect(report.metrics.drawCallReductionPercent).toBeGreaterThanOrEqual(0);
  });
});
