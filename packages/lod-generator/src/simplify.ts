import { NodeIO } from '@gltf-transform/core';
import type { Document } from '@gltf-transform/core';
import { simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { getLogger } from '@threeforged/core';
import type { LODMeshLevel } from './types.js';

let simplifierReady = false;

async function ensureSimplifier(): Promise<void> {
  if (!simplifierReady) {
    await MeshoptSimplifier.ready;
    simplifierReady = true;
  }
}

export interface SimplifyResult {
  document: Document;
  meshes: LODMeshLevel[];
  totalTriangles: number;
  totalVertices: number;
}

export async function readDocument(filePath: string): Promise<Document> {
  const io = new NodeIO();
  return io.read(filePath);
}

export async function writeDocument(filePath: string, document: Document): Promise<void> {
  const io = new NodeIO();
  await io.write(filePath, document);
}

export function countGeometry(document: Document): {
  meshes: LODMeshLevel[];
  totalTriangles: number;
  totalVertices: number;
} {
  const meshes: LODMeshLevel[] = [];
  let totalTriangles = 0;
  let totalVertices = 0;

  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const positionAccessor = primitive.getAttribute('POSITION');
      const indicesAccessor = primitive.getIndices();
      const vertices = positionAccessor ? positionAccessor.getCount() : 0;
      let triangles: number;
      if (indicesAccessor) {
        triangles = Math.floor(indicesAccessor.getCount() / 3);
      } else {
        triangles = Math.floor(vertices / 3);
      }

      meshes.push({
        name: mesh.getName() || 'unnamed',
        triangles,
        vertices,
      });

      totalTriangles += triangles;
      totalVertices += vertices;
    }
  }

  return { meshes, totalTriangles, totalVertices };
}

export async function simplifyDocument(
  filePath: string,
  ratio: number,
  errorTolerance: number,
): Promise<SimplifyResult> {
  const logger = getLogger();
  await ensureSimplifier();

  const document = await readDocument(filePath);

  logger.debug(`Simplifying with ratio=${ratio}, error=${errorTolerance}`);

  await document.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: errorTolerance }),
  );

  const { meshes, totalTriangles, totalVertices } = countGeometry(document);

  return { document, meshes, totalTriangles, totalVertices };
}
