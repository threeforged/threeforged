import type { Command } from 'commander';
import { registerAnalyzeCommand } from './analyze.js';
import { registerAuditCommand } from './audit.js';
import { registerLodCommand } from './lod.js';
import { registerInstancingCommand } from './instancing.js';
import { registerStaticCommand } from './static.js';

export function registerBuiltinCommands(program: Command): void {
  registerAnalyzeCommand(program);
  registerAuditCommand(program);
  registerLodCommand(program);
  registerInstancingCommand(program);
  registerStaticCommand(program);
}
