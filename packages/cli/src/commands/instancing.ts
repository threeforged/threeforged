import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';

export function registerInstancingCommand(program: Command): void {
  program
    .command('instancing <path>')
    .description('Optimize instanced rendering')
    .action(async () => {
      const logger = getLogger();
      try {
        await import('@threeforged/instancing-optimizer');
        logger.info('Instancing optimizer loaded');
      } catch {
        logger.error(
          '@threeforged/instancing-optimizer is not installed. Install it with:\n  pnpm add @threeforged/instancing-optimizer',
        );
      }
    });
}
