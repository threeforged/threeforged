import type { Warning, PerformanceMetrics } from '@threeforged/core';

export interface LODMeshLevel {
  name: string;
  triangles: number;
  vertices: number;
}

export interface LODLevel {
  level: number;
  targetRatio: number;
  totalTriangles: number;
  totalVertices: number;
  reductionPercent: number;
  meshes: LODMeshLevel[];
}

export interface LODFileResult {
  file: string;
  format: string;
  originalTriangles: number;
  originalVertices: number;
  levels: LODLevel[];
  outputFiles: string[];
}

export interface LODMetrics extends PerformanceMetrics {
  lodLevelsGenerated: number;
  totalFilesProcessed: number;
  totalOutputFiles: number;
  maxReductionPercent: number;
  hasAnimations: boolean;
}

export interface LODReport {
  files: LODFileResult[];
  warnings: Warning[];
  metrics: LODMetrics;
  config: {
    levels: number;
    ratio: number;
    error: number;
  };
  writeMode: boolean;
  timestamp: string;
}

export interface LODGeneratorConfig {
  levels: number;
  ratio: number;
  error: number;
  minTriangles: number;
  maxFiles: number;
  write: boolean;
  force: boolean;
  outputDir?: string;
  /** Single-file simplification mode: produce one simplified file at this ratio (0-1).
   *  When set, ignores `levels` and generates a single `_simplified` suffixed file. */
  target?: number;
}
