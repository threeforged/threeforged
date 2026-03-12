import type { ParsedDocument, Warning, PerformanceMetrics } from '@threeforged/core';

export type InstancingConfidence = 'high' | 'medium' | 'low';

export interface InstancingMeshEntry {
  name: string;
  file: string;
}

export interface InstancingCandidate {
  groupId: string;
  geometrySignature: string;
  vertices: number;
  triangles: number;
  hasIndices: boolean;
  instanceCount: number;
  drawCallsSaved: number;
  trianglesSaved: number;
  vramSavedBytes: number;
  confidence: InstancingConfidence;
  confidenceReasons: string[];
  meshes: InstancingMeshEntry[];
  totalMeshCount: number;
  sourceFiles: string[];
}

export interface InstancingMetrics extends PerformanceMetrics {
  candidateGroups: number;
  totalInstancingCandidates: number;
  totalDrawCallsSaved: number;
  totalVramSavedBytes: number;
  drawCallReductionPercent: number;
  hasAnimations: boolean;
  uniqueGeometryCount: number;
  geometryReuseRatio: number;
}

export interface InstancingReport {
  files: ParsedDocument[];
  warnings: Warning[];
  metrics: InstancingMetrics;
  candidates: InstancingCandidate[];
  timestamp: string;
}

export interface InstancingOptimizerConfig {
  instancingMinCount: number;
  maxGroups: number;
  maxEntriesPerGroup: number;
  minTrianglesPerMesh: number;
  maxFiles: number;
  materialHeterogeneityThreshold: number;
}
