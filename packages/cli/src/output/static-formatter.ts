import { basename } from 'node:path';
import Table from 'cli-table3';
import pc from 'picocolors';
import type { StaticReport } from '@threeforged/static-optimizer';

export function formatStaticReport(report: StaticReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(pc.bold(pc.cyan('ThreeForged Static Optimization Report')));
  lines.push(pc.gray(`Generated: ${report.timestamp}`));
  if (report.writeMode) {
    lines.push(pc.green('Mode: Write (merged files generated)'));
  }
  lines.push('');

  // Summary metrics
  const metricsTable = new Table({
    head: [pc.bold('Metric'), pc.bold('Value')],
    style: { head: [] },
  });

  metricsTable.push(
    ['Total Meshes', String(report.metrics.totalMeshes)],
    ['Static Meshes (est.)', String(report.metrics.staticMeshCount)],
    ['Animated Meshes (est.)', String(report.metrics.animatedMeshCount)],
    ['Total Draw Calls', String(report.metrics.totalDrawCalls)],
    ['Merge Groups', String(report.metrics.mergeGroups)],
    ['Mergeable Meshes', String(report.metrics.totalMergeableMeshes)],
    ['Draw Calls Saved', String(report.metrics.totalDrawCallsSaved)],
    ['Draw Call Reduction', `${report.metrics.drawCallReductionPercent.toFixed(1)}%`],
    ['Has Animations', report.metrics.hasAnimations ? 'Yes' : 'No'],
  );

  lines.push(pc.bold('Summary'));
  lines.push(metricsTable.toString());
  lines.push('');

  // Write-mode output files
  if (report.writeMode && report.fileResults.length > 0) {
    const outputTable = new Table({
      head: [
        pc.bold('Input'),
        pc.bold('Before'),
        pc.bold('After'),
        pc.bold('Reduction'),
        pc.bold('Output'),
      ],
      style: { head: [] },
    });

    for (const result of report.fileResults) {
      const reduction =
        result.originalDrawCalls > 0
          ? (
              ((result.originalDrawCalls - result.mergedDrawCalls) / result.originalDrawCalls) *
              100
            ).toFixed(1) + '%'
          : '0%';

      outputTable.push([
        basename(result.file),
        `${result.originalMeshCount} meshes / ${result.originalDrawCalls} draws`,
        `${result.mergedMeshCount} meshes / ${result.mergedDrawCalls} draws`,
        reduction,
        result.outputFile ? basename(result.outputFile) : 'skipped',
      ]);
    }

    lines.push(pc.bold(`Output Files (${report.fileResults.length})`));
    lines.push(outputTable.toString());
    lines.push('');
  } else if (report.writeMode) {
    lines.push(pc.yellow('Write mode enabled but no files were generated.'));
    lines.push('');
  }

  // Merge groups table
  if (report.groups.length > 0) {
    const groupsTable = new Table({
      head: [
        pc.bold('Group'),
        pc.bold('Material'),
        pc.bold('Meshes'),
        pc.bold('Draw Calls Saved'),
        pc.bold('Total Vertices'),
        pc.bold('Index Limit'),
      ],
      style: { head: [] },
      colWidths: [12, 20, 8, 18, 16, 14],
      wordWrap: true,
    });

    for (const group of report.groups) {
      groupsTable.push([
        group.groupId,
        group.materialName,
        String(group.meshCount),
        String(group.drawCallsSaved),
        group.totalVertices.toLocaleString(),
        group.exceedsIndexLimit ? pc.red('EXCEEDS') : pc.green('OK'),
      ]);
    }

    lines.push(pc.bold(`Static Merge Groups (${report.groups.length})`));
    lines.push(groupsTable.toString());
    lines.push('');

    // Group details
    for (const group of report.groups) {
      lines.push(pc.bold(`${group.groupId}: ${group.materialName}`));
      lines.push(
        `  Meshes: ${group.meshCount} | ` +
          `Triangles: ${group.totalTriangles.toLocaleString()} | ` +
          `Vertices: ${group.totalVertices.toLocaleString()}`,
      );
      lines.push(`  Draw Calls Saved: ${group.drawCallsSaved}`);

      if (group.exceedsIndexLimit) {
        lines.push(
          pc.red(`  Exceeds 16-bit index limit — needs 32-bit indices or sub-batching`),
        );
      }

      if (group.warnings.length > 0) {
        for (const warning of group.warnings) {
          lines.push(pc.yellow(`  ! ${warning}`));
        }
      }

      const meshNames = group.meshes.map((m) => `${m.name} (${m.file})`).join(', ');
      const remaining = group.totalMeshCount - group.meshes.length;
      const suffix = remaining > 0 ? ` and ${remaining} more` : '';
      lines.push(`  Meshes: ${meshNames}${suffix}`);

      if (group.sourceFiles.length > 1) {
        lines.push(`  Files: ${group.sourceFiles.join(', ')}`);
      }

      lines.push('');
    }
  } else {
    lines.push(
      pc.green(
        'No static merge candidates found — meshes already use unique materials or the scene is too small.',
      ),
    );
    lines.push('');
  }

  // Hint to use --write when in analyze mode
  if (!report.writeMode && report.groups.length > 0) {
    lines.push(pc.gray('Run with --write to merge static meshes and generate output files.'));
    lines.push('');
  }

  // Warnings
  if (report.warnings.length > 0) {
    lines.push(pc.bold(`Warnings (${report.warnings.length})`));
    const warningsTable = new Table({
      head: [pc.bold('Severity'), pc.bold('Rule'), pc.bold('Message')],
      style: { head: [] },
      colWidths: [10, 28, 64],
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

  lines.push('');
  return lines.join('\n');
}
