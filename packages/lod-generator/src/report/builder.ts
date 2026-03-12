import { relative } from 'node:path';
import type { Warning } from '@threeforged/core';
import type { LODFileResult, LODMetrics, LODReport, LODGeneratorConfig } from '../types.js';

function computeMetrics(
  files: LODFileResult[],
  config: LODGeneratorConfig,
  hasAnimations: boolean,
): LODMetrics {
  let totalTriangles = 0;
  let totalVertices = 0;
  let totalMeshes = 0;
  let totalOutputFiles = 0;
  let maxReductionPercent = 0;

  for (const file of files) {
    totalTriangles += file.originalTriangles;
    totalVertices += file.originalVertices;
    totalOutputFiles += file.outputFiles.length;

    const originalLevel = file.levels.find((l) => l.level === 0);
    if (originalLevel) {
      totalMeshes += originalLevel.meshes.length;
    }

    for (const level of file.levels) {
      if (level.reductionPercent > maxReductionPercent) {
        maxReductionPercent = level.reductionPercent;
      }
    }
  }

  return {
    totalTriangles,
    totalVertices,
    totalMeshes,
    totalMaterials: 0,
    totalTextures: 0,
    totalDrawCalls: 0,
    totalAnimations: 0,
    totalGpuMemoryBytes: 0,
    lodLevelsGenerated: config.levels,
    totalFilesProcessed: files.length,
    totalOutputFiles,
    maxReductionPercent: Number.isFinite(maxReductionPercent) ? maxReductionPercent : 0,
    hasAnimations,
  };
}

function sanitizePath(filePath: string): string {
  const cwd = process.cwd();
  return relative(cwd, filePath) || filePath;
}

export function buildLODReport(
  files: LODFileResult[],
  warnings: Warning[],
  config: LODGeneratorConfig,
  hasAnimations: boolean,
): LODReport {
  const sanitizedFiles = files.map((f) => ({
    ...f,
    file: sanitizePath(f.file),
    outputFiles: f.outputFiles.map(sanitizePath),
    levels: f.levels.map((l) => ({
      ...l,
      reductionPercent: Number.isFinite(l.reductionPercent) ? l.reductionPercent : 0,
    })),
  }));

  return {
    files: sanitizedFiles,
    warnings,
    metrics: computeMetrics(files, config, hasAnimations),
    config: {
      levels: config.levels,
      ratio: config.ratio,
      error: config.error,
    },
    writeMode: config.write,
    timestamp: new Date().toISOString(),
  };
}
