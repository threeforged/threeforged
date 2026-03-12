import type { ParsedDocument, Warning, PerformanceMetrics } from '@threeforged/core';

export type PerformanceProfile = 'mobile' | 'desktop' | 'high-end';

export interface PerformanceAuditorConfig {
  profile: PerformanceProfile;
  drawCallThresholds: Record<PerformanceProfile, number>;
  triangleThresholds: Record<PerformanceProfile, number>;
  vramBudgetMB: Record<PerformanceProfile, number>;
  maxMaterials: number;
  maxMaterialsError: number;
  maxVerticesPerMesh: number;
  instancingMinCount: number;
  maxFiles: number;
}

export interface PerformanceAuditReport {
  files: ParsedDocument[];
  warnings: Warning[];
  metrics: PerformanceMetrics;
  profile: PerformanceProfile;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: string;
}
