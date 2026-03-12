import { stat, access } from 'node:fs/promises';
import { resolve, dirname, basename, extname, join } from 'node:path';
import { findAssetFiles, getLogger, isSupportedFormat, detectFormat } from '@threeforged/core';
import type { Warning } from '@threeforged/core';

const NEGLIGIBLE_REDUCTION_THRESHOLD = 5;
import type { LODReport, LODFileResult, LODLevel, LODGeneratorConfig } from './types.js';
import { loadLODConfig } from './config.js';
import { readDocument, simplifyDocument, writeDocument, countGeometry } from './simplify.js';
import { runAllRules } from './rules/index.js';
import { buildLODReport } from './report/builder.js';

function checkNegligibleReduction(
  result: LODFileResult,
  warnings: Warning[],
): void {
  const maxReduction = Math.max(...result.levels.map((l) => l.reductionPercent));
  if (maxReduction < NEGLIGIBLE_REDUCTION_THRESHOLD && result.originalTriangles > 0) {
    warnings.push({
      rule: 'negligible-reduction',
      severity: 'info',
      message:
        `${basename(result.file)} achieved only ${maxReduction.toFixed(1)}% reduction. ` +
        `This model is likely already optimized for real-time rendering. ` +
        `LOD generation is most effective on high-poly source meshes (sculpts, photogrammetry, CAD exports).`,
    });
  }
}

function getOutputPath(inputPath: string, level: number, outputDir?: string): string {
  const dir = outputDir ? resolve(outputDir) : dirname(inputPath);
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  return join(dir, `${base}_lod${level}${ext}`);
}

function getSimplifiedOutputPath(inputPath: string, outputDir?: string): string {
  const dir = outputDir ? resolve(outputDir) : dirname(inputPath);
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  return join(dir, `${base}_simplified${ext}`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processFile(
  filePath: string,
  config: LODGeneratorConfig,
  warnings: Warning[],
): Promise<LODFileResult> {
  const logger = getLogger();
  const resolvedPath = resolve(filePath);
  logger.debug(`Processing: ${resolvedPath}`);

  const originalDoc = await readDocument(resolvedPath);
  const format = detectFormat(resolvedPath);
  const fileName = basename(resolvedPath);

  const ruleResult = runAllRules(originalDoc, fileName, config.minTriangles);
  warnings.push(...ruleResult.warnings);

  const original = countGeometry(originalDoc);

  const levels: LODLevel[] = [
    {
      level: 0,
      targetRatio: 1.0,
      totalTriangles: original.totalTriangles,
      totalVertices: original.totalVertices,
      reductionPercent: 0,
      meshes: original.meshes,
    },
  ];

  const outputFiles: string[] = [];

  for (let i = 1; i <= config.levels; i++) {
    const cumulativeRatio = Math.pow(config.ratio, i);

    logger.info(`Generating LOD${i} (${(cumulativeRatio * 100).toFixed(1)}% of original)...`);

    const result = await simplifyDocument(resolvedPath, cumulativeRatio, config.error);

    const reductionPercent =
      original.totalTriangles > 0
        ? ((original.totalTriangles - result.totalTriangles) / original.totalTriangles) * 100
        : 0;

    levels.push({
      level: i,
      targetRatio: cumulativeRatio,
      totalTriangles: result.totalTriangles,
      totalVertices: result.totalVertices,
      reductionPercent,
      meshes: result.meshes,
    });

    if (config.write) {
      const outputPath = getOutputPath(resolvedPath, i, config.outputDir);

      if (!config.force && (await fileExists(outputPath))) {
        warnings.push({
          rule: 'file-output',
          severity: 'warn',
          message: `Output file already exists: ${basename(outputPath)}. Use --force to overwrite. Skipping.`,
        });
        continue;
      }

      await writeDocument(outputPath, result.document);
      outputFiles.push(outputPath);
      logger.success(`Written: ${basename(outputPath)}`);
    }
  }

  return {
    file: resolvedPath,
    format: format || 'unknown',
    originalTriangles: original.totalTriangles,
    originalVertices: original.totalVertices,
    levels,
    outputFiles,
  };
}

async function processFileTarget(
  filePath: string,
  config: LODGeneratorConfig,
  warnings: Warning[],
): Promise<LODFileResult> {
  const logger = getLogger();
  const resolvedPath = resolve(filePath);
  const targetRatio = config.target!;
  logger.debug(`Processing (target mode): ${resolvedPath}`);

  const originalDoc = await readDocument(resolvedPath);
  const format = detectFormat(resolvedPath);
  const fileName = basename(resolvedPath);

  const ruleResult = runAllRules(originalDoc, fileName, config.minTriangles);
  warnings.push(...ruleResult.warnings);

  const original = countGeometry(originalDoc);

  logger.info(`Simplifying to ${(targetRatio * 100).toFixed(1)}% of original...`);
  const result = await simplifyDocument(resolvedPath, targetRatio, config.error);

  const reductionPercent =
    original.totalTriangles > 0
      ? ((original.totalTriangles - result.totalTriangles) / original.totalTriangles) * 100
      : 0;

  const levels: LODLevel[] = [
    {
      level: 0,
      targetRatio: 1.0,
      totalTriangles: original.totalTriangles,
      totalVertices: original.totalVertices,
      reductionPercent: 0,
      meshes: original.meshes,
    },
    {
      level: 1,
      targetRatio,
      totalTriangles: result.totalTriangles,
      totalVertices: result.totalVertices,
      reductionPercent,
      meshes: result.meshes,
    },
  ];

  const outputFiles: string[] = [];

  if (config.write) {
    const outputPath = getSimplifiedOutputPath(resolvedPath, config.outputDir);

    if (!config.force && (await fileExists(outputPath))) {
      warnings.push({
        rule: 'file-output',
        severity: 'warn',
        message: `Output file already exists: ${basename(outputPath)}. Use --force to overwrite. Skipping.`,
      });
    } else {
      await writeDocument(outputPath, result.document);
      outputFiles.push(outputPath);
      logger.success(`Written: ${basename(outputPath)}`);
    }
  }

  return {
    file: resolvedPath,
    format: format || 'unknown',
    originalTriangles: original.totalTriangles,
    originalVertices: original.totalVertices,
    levels,
    outputFiles,
  };
}

export async function generateLOD(
  inputPath: string,
  overrides?: Partial<LODGeneratorConfig>,
): Promise<LODReport> {
  const logger = getLogger();
  const config = await loadLODConfig(overrides);
  const resolvedPath = resolve(inputPath);

  const isTargetMode = config.target !== undefined;

  logger.debug(`LOD generation: ${resolvedPath}`);
  if (isTargetMode) {
    logger.debug(`Target mode: simplify to ${(config.target! * 100).toFixed(1)}%`);
  } else {
    logger.debug(`Config: ${config.levels} levels, ratio=${config.ratio}, error=${config.error}`);
  }

  if (!config.write) {
    logger.info(
      isTargetMode
        ? 'Running in analyze mode. Use --write to generate a simplified file.'
        : 'Running in analyze mode. Use --write to generate LOD files.',
    );
  }

  const stats = await stat(resolvedPath);
  let filePaths: string[];

  if (stats.isDirectory()) {
    filePaths = await findAssetFiles(resolvedPath);
    logger.info(`Found ${filePaths.length} asset files in ${resolvedPath}`);
  } else if (stats.isFile() && isSupportedFormat(resolvedPath)) {
    filePaths = [resolvedPath];
  } else {
    throw new Error(`Path is not a supported asset file or directory: ${resolvedPath}`);
  }

  if (filePaths.length === 0) {
    logger.warn('No supported asset files found');
    return buildLODReport([], [], config, false);
  }

  // LOD generation only supports GLB/GLTF (not OBJ — no standard write format)
  const gltfFiles = filePaths.filter((f) => {
    const fmt = detectFormat(f);
    return fmt === 'glb' || fmt === 'gltf';
  });

  const skippedCount = filePaths.length - gltfFiles.length;
  if (skippedCount > 0) {
    logger.warn(
      `Skipping ${skippedCount} non-GLTF file(s). LOD generation only supports GLB/GLTF format.`,
    );
  }

  if (gltfFiles.length === 0) {
    logger.warn('No GLB/GLTF files found. LOD generation only supports GLB/GLTF format.');
    return buildLODReport([], [], config, false);
  }

  if (gltfFiles.length > config.maxFiles) {
    logger.warn(
      `Found ${gltfFiles.length} files, truncating to maxFiles limit of ${config.maxFiles}`,
    );
    gltfFiles.splice(config.maxFiles);
  }

  // Validate output directory exists if specified
  if (config.write && config.outputDir) {
    const outputDirResolved = resolve(config.outputDir);
    try {
      const dirStats = await stat(outputDirResolved);
      if (!dirStats.isDirectory()) {
        throw new Error(`Output path is not a directory: ${config.outputDir}`);
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Output directory does not exist: ${config.outputDir}`);
      }
      throw err;
    }
  }

  const fileResults: LODFileResult[] = [];
  const allWarnings: Warning[] = [];
  let hasAnimations = false;

  const processFn = isTargetMode ? processFileTarget : processFile;

  for (const filePath of gltfFiles) {
    try {
      const result = await processFn(filePath, config, allWarnings);
      checkNegligibleReduction(result, allWarnings);
      fileResults.push(result);
    } catch (err) {
      logger.error(`Failed to process ${filePath}:`, err);
      allWarnings.push({
        rule: 'file-processing',
        severity: 'error',
        message: `Failed to process ${basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  for (const w of allWarnings) {
    if (w.rule === 'animation-check') {
      hasAnimations = true;
      break;
    }
  }

  return buildLODReport(fileResults, allWarnings, config, hasAnimations);
}
