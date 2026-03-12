export type {
  LogLevel,
  SupportedFormat,
  PolyCountThresholds,
  ThreeForgedConfig,
  MeshInfo,
  MaterialInfo,
  TextureInfo,
  AnimationInfo,
  WarningSeverity,
  Warning,
  PerformanceMetrics,
  ParsedDocument,
  AssetReport,
  ThreeForgedPlugin,
} from './types.js';

export { Logger, createLogger, getLogger } from './logger.js';
export { loadConfig, DEFAULT_CONFIG } from './config.js';
export { isSupportedFormat, detectFormat, findAssetFiles, getFileSize, formatBytes } from './files.js';
export { loadDocument } from './loader/index.js';
