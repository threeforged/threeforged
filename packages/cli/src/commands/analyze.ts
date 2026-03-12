import { writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';
import { formatAssetReport } from '../output/formatter.js';
import { formatJson } from '../output/json.js';

// Strip ANSI escape codes so file output is clean plain text
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

/**
 * Validate that the output path resolves to somewhere within the current working directory.
 * Prevents writing to arbitrary locations via path traversal.
 */
function validateOutputPath(outputPath: string): string {
  const resolved = resolve(outputPath);
  const cwd = process.cwd();
  const rel = relative(cwd, resolved);

  // If relative path starts with ".." it's above CWD; if it's absolute, it's on a different drive (Windows)
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(
      `Output path "${outputPath}" resolves outside the current directory. ` +
        `For safety, output files must be written within the working directory.`,
    );
  }

  return resolved;
}

export function registerAnalyzeCommand(program: Command): void {
  program
    .command('analyze <path>')
    .description('Analyze 3D assets for performance issues')
    .option('-o, --output <file>', 'Save report to a file')
    .action(async (path: string, cmdOpts: { output?: string }) => {
      const logger = getLogger();
      const opts = program.opts();

      try {
        const { analyzeAssets } = await import('@threeforged/asset-analyzer');
        const report = await analyzeAssets(path);

        const output = opts.json ? formatJson(report) : formatAssetReport(report);
        console.log(output);

        if (cmdOpts.output) {
          const validatedPath = validateOutputPath(cmdOpts.output);
          const fileContent = opts.json
            ? formatJson(report)
            : stripAnsi(formatAssetReport(report));
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
            '@threeforged/asset-analyzer is not installed. Install it with:\n  pnpm add @threeforged/asset-analyzer',
          );
        } else {
          throw err;
        }
      }
    });
}
