import { stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { globby } from 'globby';
import type { SupportedFormat } from './types.js';

const SUPPORTED_EXTENSIONS: Record<string, SupportedFormat> = {
  '.glb': 'glb',
  '.gltf': 'gltf',
  '.obj': 'obj',
};

export function isSupportedFormat(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ext in SUPPORTED_EXTENSIONS;
}

export function detectFormat(filePath: string): SupportedFormat {
  const ext = extname(filePath).toLowerCase();
  const format = SUPPORTED_EXTENSIONS[ext];
  if (!format) {
    throw new Error(`Unsupported file format: ${ext}`);
  }
  return format;
}

export async function findAssetFiles(
  dir: string,
  excludePatterns: string[] = [],
): Promise<string[]> {
  const extensions = Object.keys(SUPPORTED_EXTENSIONS).map((e) => e.slice(1));
  const patterns = extensions.map((ext) => `**/*.${ext}`);
  return globby(patterns, {
    cwd: dir,
    absolute: true,
    ignore: excludePatterns,
  });
}

export async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
