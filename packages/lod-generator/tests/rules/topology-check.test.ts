import { describe, it, expect } from 'vitest';
import { Document, Primitive } from '@gltf-transform/core';
import { checkTopology } from '../../src/rules/topology-check.js';

function createDocumentWithMesh(triangles: number, vertsPerTriangle: number): Document {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const totalVerts = triangles * vertsPerTriangle;

  const positions = doc.createAccessor()
    .setType('VEC3')
    .setArray(new Float32Array(totalVerts * 3))
    .setBuffer(buffer);

  const indices = doc.createAccessor()
    .setType('SCALAR')
    .setArray(new Uint16Array(triangles * 3))
    .setBuffer(buffer);

  const primitive = doc.createPrimitive()
    .setAttribute('POSITION', positions)
    .setIndices(indices)
    .setMode(Primitive.Mode.TRIANGLES);

  doc.createMesh('test-mesh').addPrimitive(primitive);
  return doc;
}

describe('checkTopology', () => {
  it('should warn when all meshes are flat-shaded (3 verts per tri)', () => {
    const doc = createDocumentWithMesh(100, 3);
    const warnings = checkTopology(doc, 'flat-model.glb');

    expect(warnings).toHaveLength(1);
    expect(warnings[0].rule).toBe('topology-check');
    expect(warnings[0].severity).toBe('warn');
    expect(warnings[0].message).toContain('flat-shaded geometry');
    expect(warnings[0].message).toContain('3.0 verts/tri');
  });

  it('should not warn for smooth-shaded meshes with shared vertices', () => {
    // Smooth mesh: ~1.5 verts/tri (lots of shared vertices)
    const doc = createDocumentWithMesh(100, 1.5);
    const warnings = checkTopology(doc, 'smooth-model.glb');

    expect(warnings).toHaveLength(0);
  });

  it('should not warn for empty meshes', () => {
    const doc = new Document();
    const warnings = checkTopology(doc, 'empty.glb');

    expect(warnings).toHaveLength(0);
  });

  it('should detect near-flat-shaded (2.8+ verts per tri)', () => {
    const doc = createDocumentWithMesh(100, 2.9);
    const warnings = checkTopology(doc, 'near-flat.glb');

    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('warn');
  });

  it('should give info when only some meshes are flat-shaded', () => {
    const doc = new Document();
    const buffer = doc.createBuffer();

    // Flat-shaded mesh: 3 verts/tri
    const flatPositions = doc.createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(300 * 3))
      .setBuffer(buffer);
    const flatIndices = doc.createAccessor()
      .setType('SCALAR')
      .setArray(new Uint16Array(100 * 3))
      .setBuffer(buffer);
    const flatPrim = doc.createPrimitive()
      .setAttribute('POSITION', flatPositions)
      .setIndices(flatIndices)
      .setMode(Primitive.Mode.TRIANGLES);
    doc.createMesh('flat-mesh').addPrimitive(flatPrim);

    // Smooth mesh: ~1.5 verts/tri
    const smoothPositions = doc.createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(150 * 3))
      .setBuffer(buffer);
    const smoothIndices = doc.createAccessor()
      .setType('SCALAR')
      .setArray(new Uint16Array(100 * 3))
      .setBuffer(buffer);
    const smoothPrim = doc.createPrimitive()
      .setAttribute('POSITION', smoothPositions)
      .setIndices(smoothIndices)
      .setMode(Primitive.Mode.TRIANGLES);
    doc.createMesh('smooth-mesh').addPrimitive(smoothPrim);

    const warnings = checkTopology(doc, 'mixed.glb');

    expect(warnings).toHaveLength(1);
    expect(warnings[0].severity).toBe('info');
    expect(warnings[0].message).toContain('1 of 2 meshes');
  });
});
