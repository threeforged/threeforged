import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  findAssetFiles,
  loadDocument,
  loadConfig,
  getLogger,
  isSupportedFormat,
} from '@threeforged/core';
import type { AssetReport, ParsedDocument, Warning } from '@threeforged/core';
import { runAllRules } from './rules/index.js';
import { buildReport } from './report/builder.js';

export async function analyzeAssets(inputPath: string): Promise<AssetReport> {
  const logger = getLogger();
  const config = await loadConfig();
  const resolvedPath = resolve(inputPath);

  logger.debug(`Analyzing: ${resolvedPath}`);

  const stats = await stat(resolvedPath);
  let filePaths: string[];

  if (stats.isDirectory()) {
    filePaths = await findAssetFiles(resolvedPath, config.excludePatterns);
    logger.info(`Found ${filePaths.length} asset files in ${resolvedPath}`);
  } else if (stats.isFile() && isSupportedFormat(resolvedPath)) {
    filePaths = [resolvedPath];
  } else {
    throw new Error(`Path is not a supported asset file or directory: ${resolvedPath}`);
  }

  if (filePaths.length === 0) {
    logger.warn('No supported asset files found');
    return buildReport([], []);
  }

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

  const warnings: Warning[] = runAllRules(documents, config);
  return buildReport(documents, warnings);
}
