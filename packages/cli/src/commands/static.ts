import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';

export function registerStaticCommand(program: Command): void {
  program
    .command('static <path>')
    .description('Optimize static geometry')
    .action(async () => {
      const logger = getLogger();
      try {
        await import('@threeforged/static-optimizer');
        logger.info('Static optimizer loaded');
      } catch {
        logger.error(
          '@threeforged/static-optimizer is not installed. Install it with:\n  pnpm add @threeforged/static-optimizer',
        );
      }
    });
}
