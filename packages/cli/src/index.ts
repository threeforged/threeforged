import { Command } from 'commander';
import { registerGlobalOptions } from './utils/global-options.js';
import { registerBuiltinCommands } from './commands/index.js';
import { discoverPlugins } from './plugins/discovery.js';

const program = new Command();

program
  .name('threeforged')
  .description('Modular CLI toolkit for Three.js optimization')
  .version('0.1.0');

registerGlobalOptions(program);
registerBuiltinCommands(program);
await discoverPlugins(program);

program.parse();
