import Table from 'cli-table3';
import pc from 'picocolors';
import { formatBytes } from '@threeforged/core';
import type { InstancingReport } from '@threeforged/instancing-optimizer';

function confidenceColor(confidence: string, text: string): string {
  if (confidence === 'high') return pc.green(text);
  if (confidence === 'medium') return pc.yellow(text);
  return pc.red(text);
}

export function formatInstancingReport(report: InstancingReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(pc.bold(pc.cyan('ThreeForged Instancing Optimizer Report')));
  lines.push(pc.gray(`Generated: ${report.timestamp}`));
  lines.push('');

  // Summary metrics
  const metricsTable = new Table({
    head: [pc.bold('Metric'), pc.bold('Value')],
    style: { head: [] },
  });

  metricsTable.push(
    ['Total Meshes', String(report.metrics.totalMeshes)],
    ['Total Draw Calls', String(report.metrics.totalDrawCalls)],
    ['Unique Geometries', String(report.metrics.uniqueGeometryCount)],
    ['Geometry Reuse Ratio', report.metrics.geometryReuseRatio.toFixed(2)],
    ['Candidate Groups', String(report.metrics.candidateGroups)],
    ['Total Instancing Candidates', String(report.metrics.totalInstancingCandidates)],
    ['Draw Calls Saved', String(report.metrics.totalDrawCallsSaved)],
    ['Draw Call Reduction', `${report.metrics.drawCallReductionPercent.toFixed(1)}%`],
    ['VRAM Saved (est.)', formatBytes(report.metrics.totalVramSavedBytes)],
    ['Has Animations', report.metrics.hasAnimations ? 'Yes' : 'No'],
  );

  lines.push(pc.bold('Summary'));
  lines.push(metricsTable.toString());
  lines.push('');

  // Candidates table
  if (report.candidates.length > 0) {
    const candidatesTable = new Table({
      head: [
        pc.bold('Group'),
        pc.bold('Geometry'),
        pc.bold('Instances'),
        pc.bold('Draw Calls Saved'),
        pc.bold('VRAM Saved'),
        pc.bold('Confidence'),
      ],
      style: { head: [] },
    });

    for (const candidate of report.candidates) {
      candidatesTable.push([
        candidate.groupId,
        candidate.geometrySignature,
        String(candidate.instanceCount),
        String(candidate.drawCallsSaved),
        formatBytes(candidate.vramSavedBytes),
        confidenceColor(candidate.confidence, candidate.confidence.toUpperCase()),
      ]);
    }

    lines.push(pc.bold(`Instancing Candidates (${report.candidates.length})`));
    lines.push(candidatesTable.toString());
    lines.push('');

    // Candidate details
    for (const candidate of report.candidates) {
      lines.push(pc.bold(`${candidate.groupId}: ${candidate.geometrySignature}`));
      lines.push(
        `  Confidence: ${confidenceColor(candidate.confidence, candidate.confidence.toUpperCase())}`,
      );

      for (const reason of candidate.confidenceReasons) {
        lines.push(`    - ${reason}`);
      }

      const meshNames = candidate.meshes.map((m) => `${m.name} (${m.file})`).join(', ');
      const remaining = candidate.totalMeshCount - candidate.meshes.length;
      const suffix = remaining > 0 ? ` and ${remaining} more` : '';
      lines.push(`  Meshes: ${meshNames}${suffix}`);

      if (candidate.sourceFiles.length > 1) {
        lines.push(`  Files: ${candidate.sourceFiles.join(', ')}`);
      }

      lines.push('');
    }
  } else {
    lines.push(pc.green('No instancing candidates found — geometry is already unique.'));
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
