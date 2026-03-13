import type { ParsedDocument, Warning, PerformanceMetrics } from '@threeforged/core';

export interface StaticMeshEntry {
  name: string;
  file: string;
  vertices: number;
  triangles: number;
}

export interface StaticMergeGroup {
  groupId: string;
  materialSignature: string;
  materialName: string;
  meshCount: number;
  totalVertices: number;
  totalTriangles: number;
  drawCallsSaved: number;
  vramOverheadBytes: number;
  exceedsIndexLimit: boolean;
  meshes: StaticMeshEntry[];
  totalMeshCount: number;
  sourceFiles: string[];
  warnings: string[];
}

export interface StaticFileResult {
  file: string;
  format: string;
  originalMeshCount: number;
  mergedMeshCount: number;
  originalDrawCalls: number;
  mergedDrawCalls: number;
  outputFile?: string;
}

export interface StaticMetrics extends PerformanceMetrics {
  mergeGroups: number;
  totalMergeableMeshes: number;
  totalDrawCallsSaved: number;
  drawCallReductionPercent: number;
  totalMergedVertices: number;
  totalMergedTriangles: number;
  hasAnimations: boolean;
  staticMeshCount: number;
  animatedMeshCount: number;
}

export interface StaticReport {
  files: ParsedDocument[];
  warnings: Warning[];
  metrics: StaticMetrics;
  groups: StaticMergeGroup[];
  timestamp: string;
  writeMode: boolean;
  fileResults: StaticFileResult[];
}

export interface StaticOptimizerConfig {
  minMeshesPerGroup: number;
  maxGroups: number;
  maxEntriesPerGroup: number;
  maxFiles: number;
  maxMergedVertices: number;
  write: boolean;
  force: boolean;
  outputDir?: string;
}
