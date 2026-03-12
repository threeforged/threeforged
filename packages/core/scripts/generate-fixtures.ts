/**
 * Generates minimal test GLB/OBJ fixtures for unit tests.
 * Run with: npx tsx scripts/generate-fixtures.ts
 */
import { Document, NodeIO } from '@gltf-transform/core';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(__dirname, '../tests/fixtures');

mkdirSync(fixturesDir, { recursive: true });

async function generateSimpleScene(): Promise<void> {
  const doc = new Document();
  const buffer = doc.createBuffer();

  // Create a simple triangle mesh
  const position = doc.createAccessor()
    .setType('VEC3')
    .setBuffer(buffer)
    .setArray(new Float32Array([
      0, 0, 0,
      1, 0, 0,
      0.5, 1, 0,
      // Second triangle
      1, 0, 0,
      2, 0, 0,
      1.5, 1, 0,
    ]));

  const indices = doc.createAccessor()
    .setType('SCALAR')
    .setBuffer(buffer)
    .setArray(new Uint16Array([0, 1, 2, 3, 4, 5]));

  const primitive = doc.createPrimitive()
    .setAttribute('POSITION', position)
    .setIndices(indices);

  const material = doc.createMaterial()
    .setName('SimpleMaterial')
    .setBaseColorFactor([1, 0, 0, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.8);

  primitive.setMaterial(material);

  const mesh = doc.createMesh()
    .setName('SimpleMesh')
    .addPrimitive(primitive);

  const node = doc.createNode()
    .setName('SimpleNode')
    .setMesh(mesh);

  doc.createScene()
    .setName('SimpleScene')
    .addChild(node);

  const io = new NodeIO();
  await io.write(resolve(fixturesDir, 'simple-scene.glb'), doc);
  console.log('Created simple-scene.glb');
}

async function generateHighPolyMesh(): Promise<void> {
  const doc = new Document();
  const buffer = doc.createBuffer();

  // Create a mesh with >100k triangles
  const triCount = 110_000;
  const vertCount = triCount * 3;
  const positions = new Float32Array(vertCount * 3);
  const indexArray = new Uint32Array(vertCount);

  for (let i = 0; i < vertCount; i++) {
    positions[i * 3] = Math.random() * 10;
    positions[i * 3 + 1] = Math.random() * 10;
    positions[i * 3 + 2] = Math.random() * 10;
    indexArray[i] = i;
  }

  const position = doc.createAccessor()
    .setType('VEC3')
    .setBuffer(buffer)
    .setArray(positions);

  const indices = doc.createAccessor()
    .setType('SCALAR')
    .setBuffer(buffer)
    .setArray(indexArray);

  const primitive = doc.createPrimitive()
    .setAttribute('POSITION', position)
    .setIndices(indices);

  const mesh = doc.createMesh()
    .setName('HighPolyMesh')
    .addPrimitive(primitive);

  const node = doc.createNode()
    .setName('HighPolyNode')
    .setMesh(mesh);

  doc.createScene()
    .setName('HighPolyScene')
    .addChild(node);

  const io = new NodeIO();
  await io.write(resolve(fixturesDir, 'high-poly-mesh.glb'), doc);
  console.log('Created high-poly-mesh.glb');
}

async function generateDuplicateMaterials(): Promise<void> {
  const doc = new Document();
  const buffer = doc.createBuffer();

  const position = doc.createAccessor()
    .setType('VEC3')
    .setBuffer(buffer)
    .setArray(new Float32Array([
      0, 0, 0, 1, 0, 0, 0.5, 1, 0,
    ]));

  const indices = doc.createAccessor()
    .setType('SCALAR')
    .setBuffer(buffer)
    .setArray(new Uint16Array([0, 1, 2]));

  // Two materials with identical properties
  const mat1 = doc.createMaterial()
    .setName('DupMaterial1')
    .setBaseColorFactor([0.5, 0.5, 0.5, 1])
    .setMetallicFactor(0.5)
    .setRoughnessFactor(0.5);

  const mat2 = doc.createMaterial()
    .setName('DupMaterial2')
    .setBaseColorFactor([0.5, 0.5, 0.5, 1])
    .setMetallicFactor(0.5)
    .setRoughnessFactor(0.5);

  const prim1 = doc.createPrimitive()
    .setAttribute('POSITION', position)
    .setIndices(indices)
    .setMaterial(mat1);

  const prim2 = doc.createPrimitive()
    .setAttribute('POSITION', position)
    .setIndices(indices)
    .setMaterial(mat2);

  const mesh1 = doc.createMesh().setName('Mesh1').addPrimitive(prim1);
  const mesh2 = doc.createMesh().setName('Mesh2').addPrimitive(prim2);

  const node1 = doc.createNode().setName('Node1').setMesh(mesh1);
  const node2 = doc.createNode().setName('Node2').setMesh(mesh2);

  doc.createScene().setName('DupScene').addChild(node1).addChild(node2);

  const io = new NodeIO();
  await io.write(resolve(fixturesDir, 'duplicate-materials.glb'), doc);
  console.log('Created duplicate-materials.glb');
}

function generateTestObj(): void {
  // Simple cube OBJ with quad faces
  const obj = `# Test cube
o Cube
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
v 0.0 0.0 1.0
v 1.0 0.0 1.0
v 1.0 1.0 1.0
v 0.0 1.0 1.0

usemtl DefaultMaterial

f 1 2 3 4
f 5 6 7 8
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
`;

  writeFileSync(resolve(fixturesDir, 'test-model.obj'), obj);
  console.log('Created test-model.obj');
}

async function main(): Promise<void> {
  console.log(`Generating fixtures in ${fixturesDir}...`);
  await generateSimpleScene();
  await generateHighPolyMesh();
  await generateDuplicateMaterials();
  generateTestObj();
  console.log('Done!');
}

main().catch(console.error);
