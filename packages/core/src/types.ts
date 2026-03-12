export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type SupportedFormat = 'glb' | 'gltf' | 'obj';

export interface PolyCountThresholds {
  medium: number;
  large: number;
}

export interface ThreeForgedConfig {
  polyCountThresholds: PolyCountThresholds;
  maxTextureSize: number;
  maxTextureMB: number;
  supportedFormats: SupportedFormat[];
  excludePatterns: string[];
}

export interface MeshInfo {
  name: string;
  triangles: number;
  vertices: number;
  hasIndices: boolean;
}

export interface MaterialInfo {
  name: string;
  type: string;
  properties: Record<string, unknown>;
  textures: string[];
}

export interface TextureInfo {
  name: string;
  width: number;
  height: number;
  format: string;
  gpuMemoryBytes: number;
}

export interface AnimationInfo {
  name: string;
  duration: number;
  channels: number;
}

export type WarningSeverity = 'info' | 'warn' | 'error';

export interface Warning {
  rule: string;
  severity: WarningSeverity;
  message: string;
  mesh?: string;
  material?: string;
  texture?: string;
}

export interface PerformanceMetrics {
  totalTriangles: number;
  totalVertices: number;
  totalMeshes: number;
  totalMaterials: number;
  totalTextures: number;
  totalDrawCalls: number;
  totalAnimations: number;
  totalGpuMemoryBytes: number;
}

export interface ParsedDocument {
  filePath: string;
  format: SupportedFormat;
  meshes: MeshInfo[];
  materials: MaterialInfo[];
  textures: TextureInfo[];
  animations: AnimationInfo[];
  drawCalls: number;
  fileSize: number;
}

export interface AssetReport {
  files: ParsedDocument[];
  warnings: Warning[];
  metrics: PerformanceMetrics;
  timestamp: string;
}

export interface ThreeForgedPlugin {
  name: string;
  version: string;
  description: string;
  registerCLI: (program: unknown) => void;
}
