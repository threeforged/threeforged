import { NodeIO } from '@gltf-transform/core';
import type { ParsedDocument, MeshInfo, MaterialInfo, TextureInfo, AnimationInfo, SupportedFormat } from '../types.js';
import { getLogger } from '../logger.js';

function parsePngDimensions(buffer: Uint8Array): { width: number; height: number } | null {
  // PNG signature: 137 80 78 71 13 10 26 10
  if (buffer.length < 24) return null;
  if (buffer[0] !== 137 || buffer[1] !== 80 || buffer[2] !== 78 || buffer[3] !== 71) {
    return null;
  }
  // IHDR chunk starts at offset 8 (4 length + 4 type), width at 16, height at 20
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  return { width, height };
}

function parseJpegDimensions(buffer: Uint8Array): { width: number; height: number } | null {
  // JPEG starts with FF D8, need at least a few bytes
  if (buffer.length < 10 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    // SOF markers: C0-C3, C5-C7, C9-CB, CD-CF
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = view.getUint16(offset + 5);
      const width = view.getUint16(offset + 7);
      return { width, height };
    }
    if (offset + 3 >= buffer.length) break;
    const segmentLength = view.getUint16(offset + 2);
    if (segmentLength < 2) break;
    offset += 2 + segmentLength;
  }
  return null;
}

function parseImageDimensions(buffer: Uint8Array): { width: number; height: number } {
  const png = parsePngDimensions(buffer);
  if (png) return png;
  const jpeg = parseJpegDimensions(buffer);
  if (jpeg) return jpeg;
  return { width: 0, height: 0 };
}

function detectImageFormat(buffer: Uint8Array): string {
  if (buffer[0] === 137 && buffer[1] === 80) return 'png';
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpeg';
  return 'unknown';
}

export async function loadGltf(
  filePath: string,
  format: SupportedFormat,
  fileSize: number,
): Promise<ParsedDocument> {
  const logger = getLogger();
  logger.debug(`Loading ${format.toUpperCase()} file: ${filePath}`);

  const io = new NodeIO();
  const document = await io.read(filePath);
  const root = document.getRoot();

  const meshes: MeshInfo[] = [];
  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const positionAccessor = primitive.getAttribute('POSITION');
      const indicesAccessor = primitive.getIndices();
      const vertices = positionAccessor ? positionAccessor.getCount() : 0;
      const hasIndices = indicesAccessor !== null;
      let triangles: number;
      if (hasIndices && indicesAccessor) {
        triangles = Math.floor(indicesAccessor.getCount() / 3);
      } else {
        triangles = Math.floor(vertices / 3);
      }

      meshes.push({
        name: mesh.getName() || 'unnamed',
        triangles,
        vertices,
        hasIndices,
      });
    }
  }

  const materials: MaterialInfo[] = [];
  for (const material of root.listMaterials()) {
    const textures: string[] = [];
    const properties: Record<string, unknown> = {};

    const baseColorTexture = material.getBaseColorTexture();
    if (baseColorTexture) textures.push(baseColorTexture.getName() || 'baseColor');

    const normalTexture = material.getNormalTexture();
    if (normalTexture) textures.push(normalTexture.getName() || 'normal');

    const metallicRoughnessTexture = material.getMetallicRoughnessTexture();
    if (metallicRoughnessTexture)
      textures.push(metallicRoughnessTexture.getName() || 'metallicRoughness');

    const emissiveTexture = material.getEmissiveTexture();
    if (emissiveTexture) textures.push(emissiveTexture.getName() || 'emissive');

    const occlusionTexture = material.getOcclusionTexture();
    if (occlusionTexture) textures.push(occlusionTexture.getName() || 'occlusion');

    const baseColor = material.getBaseColorFactor();
    properties.baseColorFactor = Array.from(baseColor);
    properties.metallicFactor = material.getMetallicFactor();
    properties.roughnessFactor = material.getRoughnessFactor();
    properties.alphaMode = material.getAlphaMode();
    properties.doubleSided = material.getDoubleSided();

    materials.push({
      name: material.getName() || 'unnamed',
      type: 'PBR',
      properties,
      textures,
    });
  }

  const textureInfos: TextureInfo[] = [];
  for (const texture of root.listTextures()) {
    const imageData = texture.getImage();
    let width = 0;
    let height = 0;
    let imgFormat = 'unknown';

    if (imageData) {
      const dims = parseImageDimensions(imageData);
      width = dims.width;
      height = dims.height;
      imgFormat = detectImageFormat(imageData);
    }

    // GPU memory estimate: width * height * 4 bytes (RGBA)
    const gpuMemoryBytes = width * height * 4;

    textureInfos.push({
      name: texture.getName() || 'unnamed',
      width,
      height,
      format: imgFormat,
      gpuMemoryBytes,
    });
  }

  // Extract animations
  const animations: AnimationInfo[] = [];
  for (const animation of root.listAnimations()) {
    const channels = animation.listChannels();
    const samplers = animation.listSamplers();

    // Compute duration from max sampler input time
    let duration = 0;
    for (const sampler of samplers) {
      const input = sampler.getInput();
      if (input) {
        const count = input.getCount();
        if (count > 0) {
          const maxTime = input.getElement(count - 1, [0])[0];
          if (maxTime > duration) duration = maxTime;
        }
      }
    }

    animations.push({
      name: animation.getName() || 'unnamed',
      duration: Math.round(duration * 1000) / 1000,
      channels: channels.length,
    });
  }

  // Draw calls = number of primitives (each primitive with a material = 1 draw call)
  const drawCalls = meshes.length;

  logger.debug(
    `Parsed: ${meshes.length} meshes, ${materials.length} materials, ${textureInfos.length} textures, ${animations.length} animations, ${drawCalls} draw calls`,
  );

  return {
    filePath,
    format,
    meshes,
    materials,
    textures: textureInfos,
    animations,
    drawCalls,
    fileSize,
  };
}
