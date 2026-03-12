import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';

export function registerAuditCommand(program: Command): void {
  program
    .command('audit <path>')
    .description('Audit scene performance')
    .action(async () => {
      const logger = getLogger();
      try {
        await import('@threeforged/performance-auditor');
        logger.info('Performance auditor loaded');
      } catch {
        logger.error(
          '@threeforged/performance-auditor is not installed. Install it with:\n  pnpm add @threeforged/performance-auditor',
        );
      }
    });
}
