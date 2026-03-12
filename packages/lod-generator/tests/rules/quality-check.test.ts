import { describe, it, expect } from 'vitest';
import { Document } from '@gltf-transform/core';
import { checkQuality } from '../../src/rules/quality-check.js';

function createDocumentWithMesh(name: string, triangles: number): Document {
  const doc = new Document();
  const mesh = doc.createMesh(name);
  const primitive = doc.createPrimitive();

  const vertices = triangles * 3;
  const positions = new Float32Array(vertices * 3);
  const indices = new Uint32Array(triangles * 3);
  for (let i = 0; i < indices.length; i++) {
    indices[i] = i;
  }

  const posAccessor = doc
    .createAccessor()
    .setType('VEC3')
    .setArray(positions);
  const idxAccessor = doc
    .createAccessor()
    .setType('SCALAR')
    .setArray(indices);

  primitive.setAttribute('POSITION', posAccessor).setIndices(idxAccessor);
  mesh.addPrimitive(primitive);

  return doc;
}

describe('checkQuality', () => {
  it('should return no warnings for meshes above minTriangles', () => {
    const doc = createDocumentWithMesh('highpoly', 1000);
    const warnings = checkQuality(doc, 'test.glb', 8);
    expect(warnings).toHaveLength(0);
  });

  it('should warn about meshes at or below minTriangles', () => {
    const doc = createDocumentWithMesh('lowpoly', 5);
    const warnings = checkQuality(doc, 'test.glb', 8);

    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('quality-check');
    expect(warnings[0].severity).toBe('info');
    expect(warnings[0].message).toContain('5 triangles');
    expect(warnings[0].message).toContain('below minimum (8)');
    expect(warnings[0].mesh).toBe('lowpoly');
  });

  it('should warn about meshes exactly at minTriangles', () => {
    const doc = createDocumentWithMesh('exact', 8);
    const warnings = checkQuality(doc, 'test.glb', 8);
    expect(warnings).toHaveLength(1);
  });

  it('should not warn about meshes just above minTriangles', () => {
    const doc = createDocumentWithMesh('justabove', 9);
    const warnings = checkQuality(doc, 'test.glb', 8);
    expect(warnings).toHaveLength(0);
  });

  it('should include file name in warning', () => {
    const doc = createDocumentWithMesh('small', 2);
    const warnings = checkQuality(doc, 'tree.glb', 8);
    expect(warnings[0].message).toContain('tree.glb');
  });

  it('should handle unnamed meshes', () => {
    const doc = new Document();
    const mesh = doc.createMesh(); // no name
    const primitive = doc.createPrimitive();
    const posAccessor = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(9));
    const idxAccessor = doc
      .createAccessor()
      .setType('SCALAR')
      .setArray(new Uint32Array([0, 1, 2]));
    primitive.setAttribute('POSITION', posAccessor).setIndices(idxAccessor);
    mesh.addPrimitive(primitive);

    const warnings = checkQuality(doc, 'test.glb', 8);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].mesh).toBe('unnamed');
  });
});
