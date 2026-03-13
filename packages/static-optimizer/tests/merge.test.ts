import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { mergeStaticMeshes } from '../src/merge.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../core/tests/fixtures');

describe('mergeStaticMeshes', () => {
  it('should merge a GLB file and return a valid result', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) return;

    const result = await mergeStaticMeshes(fixturePath);
    expect(result.document).toBeDefined();
    expect(result.originalMeshCount).toBeGreaterThan(0);
    expect(result.mergedMeshCount).toBeGreaterThanOrEqual(0);
    expect(result.originalDrawCalls).toBeGreaterThan(0);
    expect(result.mergedDrawCalls).toBeGreaterThanOrEqual(0);
  });

  it('should produce merged draw calls <= original', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) return;

    const result = await mergeStaticMeshes(fixturePath);
    expect(result.mergedDrawCalls).toBeLessThanOrEqual(result.originalDrawCalls);
  });

  it('should produce merged mesh count <= original', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) return;

    const result = await mergeStaticMeshes(fixturePath);
    expect(result.mergedMeshCount).toBeLessThanOrEqual(result.originalMeshCount);
  });
});
