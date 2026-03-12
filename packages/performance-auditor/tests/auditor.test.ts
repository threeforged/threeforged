import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { auditPerformance } from '../src/auditor.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../core/tests/fixtures');

describe('auditPerformance', () => {
  it('should audit a GLB fixture file', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await auditPerformance(fixturePath);
    expect(report.files).toHaveLength(1);
    expect(report.metrics.totalMeshes).toBeGreaterThan(0);
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(report.grade).toMatch(/^[ABCDF]$/);
    expect(report.profile).toBe('desktop');
    expect(report.timestamp).toBeDefined();
  });

  it('should respect profile parameter', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await auditPerformance(fixturePath, 'mobile');
    expect(report.profile).toBe('mobile');
  });

  it('should throw for unsupported files', async () => {
    await expect(auditPerformance('/nonexistent/file.fbx')).rejects.toThrow();
  });
});
