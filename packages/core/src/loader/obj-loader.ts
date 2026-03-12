import { readFile } from 'node:fs/promises';
import ObjFileParser from 'obj-file-parser';
import type { ParsedDocument, MeshInfo, MaterialInfo, TextureInfo, SupportedFormat } from '../types.js';
import { getLogger } from '../logger.js';

export async function loadObj(
  filePath: string,
  format: SupportedFormat,
  fileSize: number,
): Promise<ParsedDocument> {
  const logger = getLogger();
  logger.debug(`Loading OBJ file: ${filePath}`);

  const content = await readFile(filePath, 'utf-8');
  const parser = new ObjFileParser(content);
  const result = parser.parse();

  const meshes: MeshInfo[] = [];
  for (const model of result.models) {
    let triangles = 0;
    const hasIndices = true;

    for (const face of model.faces) {
      // N-vertex face = N-2 triangles (fan triangulation)
      const vertexCount = face.vertices.length;
      if (vertexCount >= 3) {
        triangles += vertexCount - 2;
      }
    }

    meshes.push({
      name: model.name || 'unnamed',
      triangles,
      vertices: model.vertices.length,
      hasIndices,
    });
  }

  // OBJ has limited material/texture support — we note referenced materials
  const materials: MaterialInfo[] = [];
  const seenMaterials = new Set<string>();
  for (const model of result.models) {
    for (const face of model.faces) {
      if (face.material && !seenMaterials.has(face.material)) {
        seenMaterials.add(face.material);
        materials.push({
          name: face.material,
          type: 'MTL',
          properties: {},
          textures: [],
        });
      }
    }
  }

  const textures: TextureInfo[] = [];

  // OBJ has no animations
  // Draw calls: each mesh-material combination = 1 draw call
  const drawCalls = Math.max(meshes.length, 1) * Math.max(materials.length, 1);

  logger.debug(`Parsed OBJ: ${meshes.length} meshes, ${materials.length} materials`);

  return {
    filePath,
    format,
    meshes,
    materials,
    textures,
    animations: [],
    drawCalls,
    fileSize,
  };
}
