import { NodeIO, PropertyType } from '@gltf-transform/core';
import type { Document, Node } from '@gltf-transform/core';
import { dedup, flatten, join } from '@gltf-transform/functions';
import { getLogger } from '@threeforged/core';

export interface MergeResult {
  document: Document;
  originalMeshCount: number;
  mergedMeshCount: number;
  originalDrawCalls: number;
  mergedDrawCalls: number;
}

export async function readDocument(filePath: string): Promise<Document> {
  const io = new NodeIO();
  return io.read(filePath);
}

export async function writeDocument(filePath: string, document: Document): Promise<void> {
  const io = new NodeIO();
  await io.write(filePath, document);
}

function countPrimitives(document: Document): number {
  let count = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    count += mesh.listPrimitives().length;
  }
  return count;
}

function getAnimatedNodes(document: Document): Set<Node> {
  const animated = new Set<Node>();
  for (const animation of document.getRoot().listAnimations()) {
    for (const channel of animation.listChannels()) {
      const target = channel.getTargetNode();
      if (target) animated.add(target);
    }
  }
  return animated;
}

/**
 * Merge static meshes in a GLTF/GLB document.
 *
 * Pipeline:
 * 1. dedup — collapse identical materials into shared references
 * 2. flatten — bake world transforms into vertex positions (skips animated nodes)
 * 3. join — merge primitives sharing the same material into single draw calls
 *
 * Animated nodes are preserved and excluded from merging.
 */
export async function mergeStaticMeshes(filePath: string): Promise<MergeResult> {
  const logger = getLogger();
  const document = await readDocument(filePath);

  const originalMeshCount = document.getRoot().listMeshes().length;
  const originalDrawCalls = countPrimitives(document);

  logger.debug(`Merging: ${originalMeshCount} meshes, ${originalDrawCalls} draw calls`);

  // Build animated node set before transforms modify the graph
  const animatedNodes = getAnimatedNodes(document);

  await document.transform(
    dedup({ propertyTypes: [PropertyType.MATERIAL] }),
    flatten(),
    join({ keepNamed: false, filter: (node: Node) => !animatedNodes.has(node) }),
  );

  const mergedMeshCount = document.getRoot().listMeshes().length;
  const mergedDrawCalls = countPrimitives(document);

  logger.debug(`After merge: ${mergedMeshCount} meshes, ${mergedDrawCalls} draw calls`);

  return {
    document,
    originalMeshCount,
    mergedMeshCount,
    originalDrawCalls,
    mergedDrawCalls,
  };
}
