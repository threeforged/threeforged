import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { loadGltf } from '../../src/loader/gltf-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../tests/fixtures');

describe('loadGltf', () => {
  it('should parse a simple GLB file', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      // Skip if fixtures haven't been generated yet
      return;
    }

    const doc = await loadGltf(fixturePath, 'glb', 1024);
    expect(doc.format).toBe('glb');
    expect(doc.filePath).toBe(fixturePath);
    expect(doc.meshes).toBeDefined();
    expect(Array.isArray(doc.meshes)).toBe(true);
  });

  it('should return correct structure', async () => {
    const fixturePath = resolve(fixturesDir, 'simple-scene.glb');
    if (!existsSync(fixturePath)) {
      return;
    }

    const doc = await loadGltf(fixturePath, 'glb', 1024);
    expect(doc).toHaveProperty('meshes');
    expect(doc).toHaveProperty('materials');
    expect(doc).toHaveProperty('textures');
    expect(doc).toHaveProperty('fileSize');
  });
});
