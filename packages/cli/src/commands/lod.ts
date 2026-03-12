import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';

export function registerLodCommand(program: Command): void {
  program
    .command('lod <path>')
    .description('Generate levels of detail')
    .action(async () => {
      const logger = getLogger();
      try {
        await import('@threeforged/lod-generator');
        logger.info('LOD generator loaded');
      } catch {
        logger.error(
          '@threeforged/lod-generator is not installed. Install it with:\n  pnpm add @threeforged/lod-generator',
        );
      }
    });
}
