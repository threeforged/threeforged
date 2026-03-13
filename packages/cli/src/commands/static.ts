import { writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';
import { formatStaticReport } from '../output/static-formatter.js';
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

export function registerStaticCommand(program: Command): void {
  program
    .command('static <path>')
    .description('Detect and merge static meshes in Three.js scenes')
    .option('--write', 'Merge static meshes and generate output files')
    .option('--force', 'Overwrite existing output files')
    .option('--output-dir <dir>', 'Output directory for merged files')
    .option('-o, --output <file>', 'Save report to a file')
    .action(
      async (
        path: string,
        cmdOpts: { write?: boolean; force?: boolean; outputDir?: string; output?: string },
      ) => {
        const logger = getLogger();
        const opts = program.opts();

        try {
          const { detectStaticMergeCandidates } = await import(
            '@threeforged/static-optimizer'
          );

          const overrides: Record<string, unknown> = {};
          if (cmdOpts.write) overrides.write = true;
          if (cmdOpts.force) overrides.force = true;
          if (cmdOpts.outputDir) overrides.outputDir = cmdOpts.outputDir;

          const report = await detectStaticMergeCandidates(path, overrides);

          const output = opts.json ? formatJson(report) : formatStaticReport(report);
          console.log(output);

          if (cmdOpts.output) {
            const validatedPath = validateOutputPath(cmdOpts.output);
            const fileContent = opts.json
              ? formatJson(report)
              : stripAnsi(formatStaticReport(report));
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
              '@threeforged/static-optimizer is not installed. Install it with:\n  pnpm add @threeforged/static-optimizer',
            );
          } else {
            throw err;
          }
        }
      },
    );
}
