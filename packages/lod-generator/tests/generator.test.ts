import { describe, it, expect } from 'vitest';
import { resolve, join } from 'node:path';
import { generateLOD } from '../src/generator.js';

const FIXTURES_DIR = resolve(import.meta.dirname, '../../core/tests/fixtures');
const SIMPLE_GLB = join(FIXTURES_DIR, 'simple-scene.glb');
const HIGH_POLY_GLB = join(FIXTURES_DIR, 'high-poly-mesh.glb');
const OBJ_FILE = join(FIXTURES_DIR, 'test-model.obj');

describe('generateLOD', () => {
  it('should analyze a GLB file and return LOD report', async () => {
    const report = await generateLOD(SIMPLE_GLB, { levels: 2, ratio: 0.5 });

    expect(report.files).toHaveLength(1);
    expect(report.files[0].format).toBe('glb');
    expect(report.files[0].levels).toHaveLength(3); // LOD0 + 2 levels
    expect(report.files[0].levels[0].level).toBe(0);
    expect(report.files[0].levels[0].targetRatio).toBe(1.0);
    expect(report.files[0].levels[1].level).toBe(1);
    expect(report.files[0].levels[2].level).toBe(2);
    expect(report.writeMode).toBe(false);
    expect(report.timestamp).toBeTruthy();
  });

  it('should reduce triangle count at each LOD level', async () => {
    const report = await generateLOD(HIGH_POLY_GLB, { levels: 3, ratio: 0.5 });
    const levels = report.files[0].levels;

    // Each level should have fewer triangles than the previous
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].totalTriangles).toBeLessThanOrEqual(levels[i - 1].totalTriangles);
    }
  });

  it('should increase reduction percent at each level', async () => {
    const report = await generateLOD(HIGH_POLY_GLB, { levels: 3, ratio: 0.5 });
    const levels = report.files[0].levels;

    for (let i = 2; i < levels.length; i++) {
      expect(levels[i].reductionPercent).toBeGreaterThanOrEqual(levels[i - 1].reductionPercent);
    }
  });

  it('should not generate output files in analyze mode', async () => {
    const report = await generateLOD(SIMPLE_GLB, { levels: 2 });

    expect(report.writeMode).toBe(false);
    expect(report.files[0].outputFiles).toHaveLength(0);
    expect(report.metrics.totalOutputFiles).toBe(0);
  });

  it('should skip OBJ files', async () => {
    const report = await generateLOD(OBJ_FILE, { levels: 2 });

    expect(report.files).toHaveLength(0);
    expect(report.warnings).toHaveLength(0);
  });

  it('should include config in report', async () => {
    const report = await generateLOD(SIMPLE_GLB, { levels: 4, ratio: 0.3, error: 0.05 });

    expect(report.config.levels).toBe(4);
    expect(report.config.ratio).toBe(0.3);
    expect(report.config.error).toBe(0.05);
  });

  it('should compute correct metrics', async () => {
    const report = await generateLOD(SIMPLE_GLB, { levels: 2 });

    expect(report.metrics.totalFilesProcessed).toBe(1);
    expect(report.metrics.lodLevelsGenerated).toBe(2);
    expect(report.metrics.totalTriangles).toBeGreaterThan(0);
    expect(report.metrics.totalVertices).toBeGreaterThan(0);
  });

  it('should throw for unsupported paths', async () => {
    await expect(generateLOD('/nonexistent/path')).rejects.toThrow();
  });

  it('should report mesh-level details at each LOD level', async () => {
    const report = await generateLOD(SIMPLE_GLB, { levels: 1 });
    const levels = report.files[0].levels;

    for (const level of levels) {
      expect(level.meshes.length).toBeGreaterThan(0);
      for (const mesh of level.meshes) {
        expect(mesh.name).toBeTruthy();
        expect(mesh.triangles).toBeGreaterThanOrEqual(0);
        expect(mesh.vertices).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should simplify in target mode with a single output level', async () => {
    const report = await generateLOD(HIGH_POLY_GLB, { target: 0.3 });

    expect(report.files).toHaveLength(1);
    // Target mode: level 0 (original) + level 1 (simplified)
    expect(report.files[0].levels).toHaveLength(2);
    expect(report.files[0].levels[0].level).toBe(0);
    expect(report.files[0].levels[0].targetRatio).toBe(1.0);
    expect(report.files[0].levels[1].level).toBe(1);
    expect(report.files[0].levels[1].targetRatio).toBe(0.3);
    expect(report.files[0].levels[1].totalTriangles).toBeLessThan(
      report.files[0].levels[0].totalTriangles,
    );
    expect(report.files[0].levels[1].reductionPercent).toBeGreaterThan(0);
  });

  it('should produce significant reduction on proper mesh topology', async () => {
    const report = await generateLOD(HIGH_POLY_GLB, { levels: 2, ratio: 0.5 });
    const levels = report.files[0].levels;

    // With the UV sphere fixture, we expect real simplification (>40% reduction at LOD1)
    expect(levels[1].reductionPercent).toBeGreaterThan(40);
    expect(levels[2].reductionPercent).toBeGreaterThan(70);
  });
});
