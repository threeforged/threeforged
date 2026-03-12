import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { analyzeAssets } from '../src/analyzer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../core/tests/fixtures');

describe('analyzeAssets', () => {
  it('should analyze a GLB fixture file', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const report = await analyzeAssets(fixturePath);
    expect(report.files).toHaveLength(1);
    expect(report.metrics.totalMeshes).toBeGreaterThan(0);
    expect(report.timestamp).toBeDefined();
  });

  it('should throw for unsupported files', async () => {
    await expect(analyzeAssets('/nonexistent/file.fbx')).rejects.toThrow();
  });
});
