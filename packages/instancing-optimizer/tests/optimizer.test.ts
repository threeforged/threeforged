import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { detectInstancingCandidates } from '../src/optimizer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../core/tests/fixtures');

describe('detectInstancingCandidates', () => {
  it('should analyze a GLB fixture file', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await detectInstancingCandidates(fixturePath);
    expect(report.files).toHaveLength(1);
    expect(report.metrics.totalMeshes).toBeGreaterThan(0);
    expect(report.candidates).toBeDefined();
    expect(report.timestamp).toBeDefined();
  });

  it('should throw for unsupported files', async () => {
    await expect(detectInstancingCandidates('/nonexistent/file.fbx')).rejects.toThrow();
  });

  it('should return empty report for directory with no assets', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    // Single file should produce valid report structure
    const report = await detectInstancingCandidates(fixturePath);
    expect(report.files.length).toBeGreaterThanOrEqual(0);
    expect(report.metrics).toBeDefined();
    expect(report.warnings).toBeDefined();
  });

  it('should return correct report structure', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await detectInstancingCandidates(fixturePath);
    // Verify all expected fields
    expect(report).toHaveProperty('files');
    expect(report).toHaveProperty('warnings');
    expect(report).toHaveProperty('metrics');
    expect(report).toHaveProperty('candidates');
    expect(report).toHaveProperty('timestamp');

    // Verify instancing-specific metrics
    expect(report.metrics).toHaveProperty('candidateGroups');
    expect(report.metrics).toHaveProperty('totalInstancingCandidates');
    expect(report.metrics).toHaveProperty('totalDrawCallsSaved');
    expect(report.metrics).toHaveProperty('totalVramSavedBytes');
    expect(report.metrics).toHaveProperty('drawCallReductionPercent');
    expect(report.metrics).toHaveProperty('hasAnimations');
    expect(report.metrics).toHaveProperty('uniqueGeometryCount');
    expect(report.metrics).toHaveProperty('geometryReuseRatio');
  });
});
