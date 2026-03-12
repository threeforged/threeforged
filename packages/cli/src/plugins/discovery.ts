import type { Command } from 'commander';
import type { ThreeForgedPlugin } from '@threeforged/core';
import { getLogger } from '@threeforged/core';
import { readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Only these known @threeforged packages are auto-discovered as plugins.
 * This prevents dependency confusion attacks where a malicious package like
 * @threeforged/backdoor gets auto-imported just by being installed.
 */
const KNOWN_PLUGINS = new Set([
  'asset-analyzer',
  'performance-auditor',
  'lod-generator',
  'instancing-optimizer',
  'static-optimizer',
]);

function isValidPlugin(obj: unknown): obj is ThreeForgedPlugin {
  if (!obj || typeof obj !== 'object') return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    typeof p.version === 'string' &&
    typeof p.description === 'string' &&
    typeof p.registerCLI === 'function'
  );
}

export async function discoverPlugins(program: Command): Promise<void> {
  const logger = getLogger();
  const nodeModulesDir = resolve(process.cwd(), 'node_modules', '@threeforged');

  if (!existsSync(nodeModulesDir)) {
    logger.debug('No @threeforged packages found in node_modules');
    return;
  }

  try {
    const entries = await readdir(nodeModulesDir);
    for (const entry of entries) {
      // Skip built-in packages
      if (entry === 'core' || entry === 'cli') continue;

      // Only auto-discover known, trusted plugins
      if (!KNOWN_PLUGINS.has(entry)) {
        logger.warn(
          `Skipping unknown package @threeforged/${entry}. ` +
            `Only official ThreeForged plugins are auto-discovered.`,
        );
        continue;
      }

      const pkgPath = join(nodeModulesDir, entry);
      try {
        const mod = await import(pkgPath);
        if (isValidPlugin(mod.threeforgedPlugin)) {
          logger.debug(`Discovered plugin: ${mod.threeforgedPlugin.name} v${mod.threeforgedPlugin.version}`);
          mod.threeforgedPlugin.registerCLI(program);
        }
      } catch {
        // Plugin not functional — skip silently
      }
    }
  } catch {
    logger.debug('Could not scan for plugins');
  }
}
