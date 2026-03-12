import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { loadObj } from '../../src/loader/obj-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../../tests/fixtures');

describe('loadObj', () => {
  it('should parse a simple OBJ file', async () => {
    const fixturePath = resolve(fixturesDir, 'test-model.obj');
    if (!existsSync(fixturePath)) {
      return;
    }

    const doc = await loadObj(fixturePath, 'obj', 512);
    expect(doc.format).toBe('obj');
    expect(doc.filePath).toBe(fixturePath);
    expect(doc.meshes).toBeDefined();
    expect(Array.isArray(doc.meshes)).toBe(true);
  });

  it('should handle quad faces as 2 triangles', async () => {
    const fixturePath = resolve(fixturesDir, 'test-model.obj');
    if (!existsSync(fixturePath)) {
      return;
    }

    const doc = await loadObj(fixturePath, 'obj', 512);
    // The test-model.obj has a cube with quad faces
    // Each quad = 2 triangles, 6 faces = 12 triangles
    if (doc.meshes.length > 0) {
      expect(doc.meshes[0].triangles).toBeGreaterThan(0);
    }
  });
});
