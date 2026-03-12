import type { Command } from 'commander';
import { createLogger } from '@threeforged/core';

export function registerGlobalOptions(program: Command): void {
  program
    .option('--json', 'Output results as JSON')
    .option('--debug', 'Enable debug logging')
    .option('--config <path>', 'Path to config file');

  program.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
      createLogger('debug');
    } else {
      createLogger('info');
    }
  });
}
