import { stat, access } from 'node:fs/promises';
import { resolve, dirname, basename, extname, join } from 'node:path';
import {
  findAssetFiles,
  loadDocument,
  getLogger,
  isSupportedFormat,
  detectFormat,
} from '@threeforged/core';
import type { ParsedDocument } from '@threeforged/core';
import type { StaticReport, StaticOptimizerConfig, StaticFileResult } from './types.js';
import { loadStaticConfig } from './config.js';
import { runAllRules } from './rules/index.js';
import { buildStaticReport } from './report/builder.js';
import { mergeStaticMeshes, writeDocument } from './merge.js';

function getOutputPath(inputPath: string, outputDir?: string): string {
  const dir = outputDir ? resolve(outputDir) : dirname(inputPath);
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  return join(dir, `${base}_merged${ext}`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function detectStaticMergeCandidates(
  inputPath: string,
  overrides?: Partial<StaticOptimizerConfig>,
): Promise<StaticReport> {
  const logger = getLogger();
  const config = await loadStaticConfig(overrides);
  const resolvedPath = resolve(inputPath);

  logger.debug(`Detecting static merge candidates: ${resolvedPath}`);

  if (!config.write) {
    logger.info('Running in analyze mode. Use --write to merge static meshes.');
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
    return buildStaticReport([], [], [], 0, false, []);
  }

  // Enforce maxFiles limit
  if (filePaths.length > config.maxFiles) {
    logger.warn(
      `Found ${filePaths.length} files, truncating to maxFiles limit of ${config.maxFiles}`,
    );
    filePaths = filePaths.slice(0, config.maxFiles);
  }

  // Load documents for analysis
  const documents: ParsedDocument[] = [];
  for (const filePath of filePaths) {
    try {
      logger.debug(`Loading: ${filePath}`);
      const doc = await loadDocument(filePath);
      documents.push(doc);
    } catch (err) {
      logger.error(`Failed to load ${filePath}:`, err);
    }
  }

  const { groups, warnings, animatedMeshCount } = runAllRules(documents, config);

  // Write mode: merge meshes and output new files
  const fileResults: StaticFileResult[] = [];

  if (config.write) {
    // Filter to GLB/GLTF only (OBJ has no standard write format)
    const gltfPaths = filePaths.filter((f) => {
      const fmt = detectFormat(f);
      return fmt === 'glb' || fmt === 'gltf';
    });

    const skippedCount = filePaths.length - gltfPaths.length;
    if (skippedCount > 0) {
      logger.warn(
        `Skipping ${skippedCount} non-GLTF file(s). Static merging only supports GLB/GLTF format.`,
      );
    }

    // Validate output directory exists if specified
    if (config.outputDir) {
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

    for (const filePath of gltfPaths) {
      const format = detectFormat(filePath);
      const outputPath = getOutputPath(filePath, config.outputDir);

      if (!config.force && (await fileExists(outputPath))) {
        warnings.push({
          rule: 'file-output',
          severity: 'warn',
          message: `Output file already exists: ${basename(outputPath)}. Use --force to overwrite. Skipping.`,
        });
        continue;
      }

      try {
        const result = await mergeStaticMeshes(filePath);
        await writeDocument(outputPath, result.document);
        logger.success(`Written: ${basename(outputPath)}`);

        fileResults.push({
          file: filePath,
          format,
          originalMeshCount: result.originalMeshCount,
          mergedMeshCount: result.mergedMeshCount,
          originalDrawCalls: result.originalDrawCalls,
          mergedDrawCalls: result.mergedDrawCalls,
          outputFile: outputPath,
        });
      } catch (err) {
        logger.error(`Failed to merge ${filePath}:`, err);
        warnings.push({
          rule: 'file-processing',
          severity: 'error',
          message: `Failed to merge ${basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  return buildStaticReport(documents, warnings, groups, animatedMeshCount, config.write, fileResults);
}
