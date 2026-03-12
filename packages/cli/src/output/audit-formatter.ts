import { basename } from 'node:path';
import Table from 'cli-table3';
import pc from 'picocolors';
import { formatBytes } from '@threeforged/core';
import type { PerformanceAuditReport } from '@threeforged/performance-auditor';

function scoreColor(score: number, text: string): string {
  if (score >= 70) return pc.green(text);
  if (score >= 40) return pc.yellow(text);
  return pc.red(text);
}

function profileLabel(profile: string): string {
  switch (profile) {
    case 'mobile':
      return pc.yellow(profile.toUpperCase());
    case 'desktop':
      return pc.cyan(profile.toUpperCase());
    case 'high-end':
      return pc.magenta(profile.toUpperCase());
    default:
      return profile.toUpperCase();
  }
}

export function formatAuditReport(report: PerformanceAuditReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(pc.bold(pc.cyan('ThreeForged Performance Audit Report')));
  lines.push(pc.gray(`Generated: ${report.timestamp}`));
  lines.push(`Profile: ${profileLabel(report.profile)}`);
  lines.push('');

  // Score display
  const scoreText = `Performance Score: ${report.score}/100 (${report.grade})`;
  lines.push(pc.bold(scoreColor(report.score, scoreText)));
  lines.push('');

  // Summary metrics
  const metricsTable = new Table({
    head: [pc.bold('Metric'), pc.bold('Value')],
    style: { head: [] },
  });

  const textureVram = report.files.reduce(
    (sum, f) => sum + f.textures.reduce((s, t) => s + t.gpuMemoryBytes, 0),
    0,
  );
  const geometryVram = report.metrics.totalGpuMemoryBytes - textureVram;

  metricsTable.push(
    ['Total Meshes', String(report.metrics.totalMeshes)],
    ['Total Triangles', report.metrics.totalTriangles.toLocaleString()],
    ['Total Vertices', report.metrics.totalVertices.toLocaleString()],
    ['Total Materials', String(report.metrics.totalMaterials)],
    ['Total Textures', String(report.metrics.totalTextures)],
    ['Total Draw Calls', String(report.metrics.totalDrawCalls)],
    ['Total Animations', String(report.metrics.totalAnimations)],
    ['GPU Memory (est.)', formatBytes(report.metrics.totalGpuMemoryBytes)],
    ['  Texture VRAM', formatBytes(textureVram)],
    ['  Geometry VRAM', formatBytes(geometryVram)],
  );

  lines.push(pc.bold('Summary'));
  lines.push(metricsTable.toString());
  lines.push('');

  // Files table
  if (report.files.length > 0) {
    const filesTable = new Table({
      head: [
        pc.bold('File'),
        pc.bold('Format'),
        pc.bold('Size'),
        pc.bold('Meshes'),
        pc.bold('Verts'),
        pc.bold('Tris'),
        pc.bold('Mats'),
        pc.bold('Draws'),
        pc.bold('Anims'),
      ],
      style: { head: [] },
    });

    for (const file of report.files) {
      const totalTriangles = file.meshes.reduce((sum, m) => sum + m.triangles, 0);
      const totalVertices = file.meshes.reduce((sum, m) => sum + m.vertices, 0);
      filesTable.push([
        basename(file.filePath),
        file.format.toUpperCase(),
        formatBytes(file.fileSize),
        String(file.meshes.length),
        totalVertices.toLocaleString(),
        totalTriangles.toLocaleString(),
        String(file.materials.length),
        String(file.drawCalls),
        String(file.animations.length),
      ]);
    }

    lines.push(pc.bold('Files'));
    lines.push(filesTable.toString());
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
