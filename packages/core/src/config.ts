import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { ThreeForgedConfig } from './types.js';
import { getLogger } from './logger.js';

export const DEFAULT_CONFIG: ThreeForgedConfig = {
  polyCountThresholds: {
    medium: 50_000,
    large: 100_000,
  },
  maxTextureSize: 4096,
  maxTextureMB: 64,
  supportedFormats: ['glb', 'gltf', 'obj'],
  excludePatterns: ['**/node_modules/**', '**/dist/**'],
};

export async function loadConfig(configPath?: string): Promise<ThreeForgedConfig> {
  const logger = getLogger();
  const candidates = configPath
    ? [resolve(configPath)]
    : [
        resolve(process.cwd(), 'threeforged.config.js'),
        resolve(process.cwd(), 'threeforged.config.mjs'),
      ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        const imported = (await import(candidate)) as { default?: Partial<ThreeForgedConfig> };
        const userConfig = imported.default ?? {};
        logger.debug(`Loaded config from ${candidate}`);
        return { ...DEFAULT_CONFIG, ...userConfig };
      } catch (err) {
        logger.warn(`Failed to load config from ${candidate}:`, err);
      }
    }
  }

  logger.debug('Using default configuration');
  return { ...DEFAULT_CONFIG };
}
