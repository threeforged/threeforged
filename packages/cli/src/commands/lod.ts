import { writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';
import { formatLODReport } from '../output/lod-formatter.js';
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

function validateOutputDir(outputDir: string): string {
  const resolved = resolve(outputDir);
  const cwd = process.cwd();
  const rel = relative(cwd, resolved);

  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(
      `Output directory "${outputDir}" resolves outside the current directory. ` +
        `For safety, generated files must be written within the working directory.`,
    );
  }

  return resolved;
}

export function registerLodCommand(program: Command): void {
  program
    .command('lod <path>')
    .description('Generate levels of detail for Three.js meshes')
    .option('--levels <number>', 'Number of LOD levels to generate (default: 3)')
    .option('--ratio <number>', 'Triangle reduction ratio per level, 0-1 (default: 0.5)')
    .option('--target <number>', 'Simplify to a single file at this ratio (0-1)')
    .option('--error <number>', 'Simplification error tolerance (default: 0.01)')
    .option('--write', 'Generate output files (default: analyze only)')
    .option('--force', 'Overwrite existing output files')
    .option('--output-dir <dir>', 'Output directory for generated files')
    .option('-o, --output <file>', 'Save report to a file')
    .action(
      async (
        path: string,
        cmdOpts: {
          levels?: string;
          ratio?: string;
          target?: string;
          error?: string;
          write?: boolean;
          force?: boolean;
          outputDir?: string;
          output?: string;
        },
      ) => {
        const logger = getLogger();
        const opts = program.opts();

        try {
          const { generateLOD } = await import('@threeforged/lod-generator');

          const overrides: Record<string, unknown> = {};

          if (cmdOpts.target !== undefined) {
            const val = parseFloat(cmdOpts.target);
            if (Number.isNaN(val)) throw new Error('--target must be a number');
            overrides.target = val;
          }
          if (cmdOpts.levels !== undefined) {
            const val = parseInt(cmdOpts.levels, 10);
            if (Number.isNaN(val)) throw new Error('--levels must be a number');
            overrides.levels = val;
          }
          if (cmdOpts.ratio !== undefined) {
            const val = parseFloat(cmdOpts.ratio);
            if (Number.isNaN(val)) throw new Error('--ratio must be a number');
            overrides.ratio = val;
          }
          if (cmdOpts.error !== undefined) {
            const val = parseFloat(cmdOpts.error);
            if (Number.isNaN(val)) throw new Error('--error must be a number');
            overrides.error = val;
          }
          if (cmdOpts.write) overrides.write = true;
          if (cmdOpts.force) overrides.force = true;
          if (cmdOpts.outputDir) {
            validateOutputDir(cmdOpts.outputDir);
            overrides.outputDir = cmdOpts.outputDir;
          }

          const report = await generateLOD(path, overrides);

          const output = opts.json ? formatJson(report) : formatLODReport(report);
          console.log(output);

          if (cmdOpts.output) {
            const validatedPath = validateOutputPath(cmdOpts.output);
            const fileContent = opts.json
              ? formatJson(report)
              : stripAnsi(formatLODReport(report));
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
              '@threeforged/lod-generator is not installed. Install it with:\n  pnpm add @threeforged/lod-generator',
            );
          } else {
            throw err;
          }
        }
      },
    );
}
