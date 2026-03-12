import { writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Command } from 'commander';
import { getLogger } from '@threeforged/core';
import { formatAuditReport } from '../output/audit-formatter.js';
import { formatJson } from '../output/json.js';

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

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

export function registerAuditCommand(program: Command): void {
  program
    .command('audit <path>')
    .description('Audit scene performance')
    .option('-p, --profile <profile>', 'Performance profile: mobile, desktop, high-end', 'desktop')
    .option('-o, --output <file>', 'Save report to a file')
    .action(async (path: string, cmdOpts: { profile?: string; output?: string }) => {
      const logger = getLogger();
      const opts = program.opts();

      try {
        const { auditPerformance } = await import('@threeforged/performance-auditor');

        const profile = cmdOpts.profile as 'mobile' | 'desktop' | 'high-end' | undefined;
        const report = await auditPerformance(path, profile);

        const output = opts.json ? formatJson(report) : formatAuditReport(report);
        console.log(output);

        if (cmdOpts.output) {
          const validatedPath = validateOutputPath(cmdOpts.output);
          const fileContent = opts.json
            ? formatJson(report)
            : stripAnsi(formatAuditReport(report));
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
            '@threeforged/performance-auditor is not installed. Install it with:\n  pnpm add @threeforged/performance-auditor',
          );
        } else {
          throw err;
        }
      }
    });
}
