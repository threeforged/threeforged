import { basename } from 'node:path';
import Table from 'cli-table3';
import pc from 'picocolors';
import type { LODReport } from '@threeforged/lod-generator';

function reductionColor(percent: number, text: string): string {
  if (percent >= 80) return pc.red(text);
  if (percent >= 50) return pc.yellow(text);
  return pc.green(text);
}

export function formatLODReport(report: LODReport): string {
  const lines: string[] = [];
  const isTargetMode = report.files.length > 0 && report.files[0].levels.length === 2 &&
    report.files[0].levels[1].level === 1;

  lines.push('');
  lines.push(pc.bold(pc.cyan('ThreeForged LOD Generator Report')));
  lines.push(pc.gray(`Generated: ${report.timestamp}`));
  lines.push(
    `Mode: ${report.writeMode ? pc.green('WRITE (files generated)') : pc.yellow('ANALYZE (no files written)')}`,
  );
  if (isTargetMode) {
    const targetRatio = report.files[0]?.levels[1]?.targetRatio;
    lines.push(`Target: simplify to ${((targetRatio ?? 0) * 100).toFixed(0)}% of original`);
  } else {
    lines.push(
      `Config: ${report.config.levels} levels, ${(report.config.ratio * 100).toFixed(0)}% ratio, ${report.config.error} error tolerance`,
    );
  }
  lines.push('');

  for (const file of report.files) {
    lines.push(pc.bold(`${basename(file.file)} (${file.format.toUpperCase()})`));

    const lodTable = new Table({
      head: [
        pc.bold('Level'),
        pc.bold('Target'),
        pc.bold('Triangles'),
        pc.bold('Vertices'),
        pc.bold('Reduction'),
      ],
      style: { head: [] },
    });

    for (const level of file.levels) {
      const targetText =
        level.level === 0 ? 'original' : `${(level.targetRatio * 100).toFixed(1)}%`;
      const reductionText = `${level.reductionPercent.toFixed(1)}%`;
      const levelLabel =
        level.level === 0 ? 'Original' : isTargetMode ? 'Simplified' : `LOD${level.level}`;

      lodTable.push([
        levelLabel,
        targetText,
        level.totalTriangles.toLocaleString(),
        level.totalVertices.toLocaleString(),
        level.level === 0 ? pc.gray('—') : reductionColor(level.reductionPercent, reductionText),
      ]);
    }

    lines.push(lodTable.toString());

    if (file.outputFiles.length > 0) {
      lines.push(pc.green('  Generated files:'));
      for (const outputFile of file.outputFiles) {
        lines.push(`    ${outputFile}`);
      }
    }

    lines.push('');
  }

  if (report.files.length > 1) {
    const metricsTable = new Table({
      head: [pc.bold('Metric'), pc.bold('Value')],
      style: { head: [] },
    });

    metricsTable.push(
      ['Files Processed', String(report.metrics.totalFilesProcessed)],
      ['Total Meshes', String(report.metrics.totalMeshes)],
      ['Original Triangles', report.metrics.totalTriangles.toLocaleString()],
      ['LOD Levels Generated', String(report.metrics.lodLevelsGenerated)],
      ['Max Reduction', `${report.metrics.maxReductionPercent.toFixed(1)}%`],
      ['Has Animations', report.metrics.hasAnimations ? 'Yes' : 'No'],
    );

    if (report.writeMode) {
      metricsTable.push(['Files Written', String(report.metrics.totalOutputFiles)]);
    }

    lines.push(pc.bold('Summary'));
    lines.push(metricsTable.toString());
    lines.push('');
  }

  if (report.warnings.length > 0) {
    lines.push(pc.bold(`Warnings (${report.warnings.length})`));
    const warningsTable = new Table({
      head: [pc.bold('Severity'), pc.bold('Rule'), pc.bold('Message')],
      style: { head: [] },
      colWidths: [10, 22, 70],
      wordWrap: true,
    });

    for (const warning of report.warnings) {
      const severity =
        warning.severity === 'error'
          ? pc.red(warning.severity.toUpperCase())
          : warning.severity === 'warn'
            ? pc.yellow(warning.severity.toUpperCase())
            : pc.blue(warning.severity.toUpperCase());

      warningsTable.push([severity, warning.rule, warning.message]);
    }

    lines.push(warningsTable.toString());
  } else {
    lines.push(pc.green('No warnings found!'));
  }

  if (!report.writeMode) {
    lines.push('');
    lines.push(pc.gray('Tip: Run with --write to generate LOD files.'));
  }

  lines.push('');
  return lines.join('\n');
}
