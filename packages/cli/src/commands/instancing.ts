import { writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';
import { formatInstancingReport } from '../output/instancing-formatter.js';
import { formatJson } from '../output/json.js';

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

function validateOutputPath(outputPath: string): string {
  const resolved = resolve(outputPath);
  const cwd = process.cwd();
  const rel = relative(cwd, resolved);

  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(
      `Output path "${outputPath}" resolves outside the current directory. ` +
        `For safety, output files must be written within the working directory.`,
    );
  }

  return resolved;
}

export function registerInstancingCommand(program: Command): void {
  program
    .command('instancing <path>')
    .description('Detect instancing opportunities in Three.js scenes')
    .option('-o, --output <file>', 'Save report to a file')
    .action(async (path: string, cmdOpts: { output?: string }) => {
      const logger = getLogger();
      const opts = program.opts();

      try {
        const { detectInstancingCandidates } = await import(
          '@threeforged/instancing-optimizer'
        );

        const report = await detectInstancingCandidates(path);

        const output = opts.json ? formatJson(report) : formatInstancingReport(report);
        console.log(output);

        if (cmdOpts.output) {
          const validatedPath = validateOutputPath(cmdOpts.output);
          const fileContent = opts.json
            ? formatJson(report)
            : stripAnsi(formatInstancingReport(report));
          await writeFile(validatedPath, fileContent, 'utf-8');
          logger.success(`Report saved to ${validatedPath}`);
        }
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code: string }).code === 'ERR_MODULE_NOT_FOUND'
        ) {
          logger.error(
            '@threeforged/instancing-optimizer is not installed. Install it with:\n  pnpm add @threeforged/instancing-optimizer',
          );
        } else {
          throw err;
        }
      }
    });
}
