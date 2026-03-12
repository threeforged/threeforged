import { detectFormat, getFileSize, formatBytes } from '../files.js';
import type { ParsedDocument } from '../types.js';
import { loadGltf } from './gltf-loader.js';
import { loadObj } from './obj-loader.js';

/** Maximum file size for loading: 512 MB. Covers large game assets while preventing DoS. */
const MAX_FILE_SIZE_BYTES = 512 * 1024 * 1024;

export async function loadDocument(filePath: string): Promise<ParsedDocument> {
  const format = detectFormat(filePath);
  const fileSize = await getFileSize(filePath);

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File "${filePath}" is ${formatBytes(fileSize)}, which exceeds the ${formatBytes(MAX_FILE_SIZE_BYTES)} limit. ` +
        `Split the asset into smaller files or process it with a dedicated tool.`,
    );
  }

  switch (format) {
    case 'glb':
    case 'gltf':
      return loadGltf(filePath, format, fileSize);
    case 'obj':
      return loadObj(filePath, format, fileSize);
    default:
      throw new Error(
        `Format ".${format}" is not yet supported. FBX support is coming in a future release.`,
      );
  }
}
