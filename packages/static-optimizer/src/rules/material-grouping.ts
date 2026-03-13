import { basename } from 'node:path';
import type { ParsedDocument, MaterialInfo } from '@threeforged/core';
import type { StaticMergeGroup, StaticOptimizerConfig } from '../types.js';

/**
 * Hash material properties to a stable string for grouping.
 * Materials with the same hash are compatible for static batching.
 */
function hashMaterial(material: MaterialInfo): string {
  const props = material.properties;
  const parts: string[] = [material.type];

  // Base color factor
  if (Array.isArray(props.baseColorFactor)) {
    parts.push(`bc:${(props.baseColorFactor as number[]).map((v) => v.toFixed(3)).join(',')}`);
  }

  // Metallic/roughness
  if (typeof props.metallicFactor === 'number') {
    parts.push(`m:${props.metallicFactor.toFixed(3)}`);
  }
  if (typeof props.roughnessFactor === 'number') {
    parts.push(`r:${props.roughnessFactor.toFixed(3)}`);
  }

  // Alpha mode and double-sided
  if (props.alphaMode) parts.push(`a:${props.alphaMode}`);
  if (props.doubleSided) parts.push('ds');

  // Texture references (sorted for stability)
  if (material.textures.length > 0) {
    parts.push(`t:${[...material.textures].sort().join('+')}`);
  }

  return parts.join('|');
}

/**
 * Build a map from material name → material hash for all materials across all documents.
 */
function buildMaterialHashMap(documents: ParsedDocument[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const doc of documents) {
    for (const mat of doc.materials) {
      if (!map.has(mat.name)) {
        map.set(mat.name, hashMaterial(mat));
      }
    }
  }
  return map;
}

/**
 * Build a map from mesh name → material name by matching mesh indices to material indices.
 * In GLTF, each primitive (mesh entry) maps 1:1 with materials in order.
 */
function buildMeshMaterialMap(doc: ParsedDocument): Map<string, string> {
  const map = new Map<string, string>();
  for (let i = 0; i < doc.meshes.length; i++) {
    const mesh = doc.meshes[i];
    // Material at same index, or the closest available material
    const material = doc.materials[Math.min(i, doc.materials.length - 1)];
    if (material) {
      map.set(`${mesh.name}::${i}`, material.name);
    }
  }
  return map;
}

export interface MaterialGroupResult {
  groups: StaticMergeGroup[];
  meshMaterialHashes: Map<string, string>;
}

export function groupByMaterial(
  documents: ParsedDocument[],
  config: StaticOptimizerConfig,
): MaterialGroupResult {
  const materialHashes = buildMaterialHashMap(documents);

  // Map: materialHash → list of mesh entries with file info
  const hashGroups = new Map<
    string,
    {
      materialName: string;
      entries: { name: string; file: string; vertices: number; triangles: number; meshKey: string }[];
    }
  >();

  // Track mesh → materialHash for downstream rules
  const meshMaterialHashes = new Map<string, string>();

  for (const doc of documents) {
    const fileName = basename(doc.filePath);
    const meshMatMap = buildMeshMaterialMap(doc);

    for (let i = 0; i < doc.meshes.length; i++) {
      const mesh = doc.meshes[i];
      const meshKey = `${mesh.name}::${i}`;
      const materialName = meshMatMap.get(meshKey);
      if (!materialName) continue;

      const materialHash = materialHashes.get(materialName);
      if (!materialHash) continue;

      // Track for downstream rules
      meshMaterialHashes.set(`${fileName}:${meshKey}`, materialHash);

      const existing = hashGroups.get(materialHash) || {
        materialName,
        entries: [],
      };
      existing.entries.push({
        name: mesh.name,
        file: fileName,
        vertices: mesh.vertices,
        triangles: mesh.triangles,
        meshKey,
      });
      hashGroups.set(materialHash, existing);
    }
  }

  // Filter groups that meet minimum count, sort by impact (most meshes first, then most triangles)
  const sortedEntries = [...hashGroups.entries()]
    .filter(([, group]) => group.entries.length >= config.minMeshesPerGroup)
    .sort((a, b) => {
      const countDiff = b[1].entries.length - a[1].entries.length;
      if (countDiff !== 0) return countDiff;
      const triA = a[1].entries.reduce((sum, e) => sum + e.triangles, 0);
      const triB = b[1].entries.reduce((sum, e) => sum + e.triangles, 0);
      return triB - triA;
    });

  const groups: StaticMergeGroup[] = [];

  for (let i = 0; i < Math.min(sortedEntries.length, config.maxGroups); i++) {
    const [hash, group] = sortedEntries[i];
    const totalVertices = group.entries.reduce((sum, e) => sum + e.vertices, 0);
    const totalTriangles = group.entries.reduce((sum, e) => sum + e.triangles, 0);
    const sourceFiles = [...new Set(group.entries.map((e) => e.file))];
    const shownMeshes = group.entries.slice(0, config.maxEntriesPerGroup).map((e) => ({
      name: e.name,
      file: e.file,
      vertices: e.vertices,
      triangles: e.triangles,
    }));

    groups.push({
      groupId: `merge-${i}`,
      materialSignature: hash,
      materialName: group.materialName,
      meshCount: group.entries.length,
      totalVertices,
      totalTriangles,
      drawCallsSaved: 0,
      vramOverheadBytes: 0,
      exceedsIndexLimit: false,
      meshes: shownMeshes,
      totalMeshCount: group.entries.length,
      sourceFiles,
      warnings: [],
    });
  }

  return { groups, meshMaterialHashes };
}
