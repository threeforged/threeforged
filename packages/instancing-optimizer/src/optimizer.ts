import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  findAssetFiles,
  loadDocument,
  getLogger,
  isSupportedFormat,
} from '@threeforged/core';
import type { ParsedDocument } from '@threeforged/core';
import type { InstancingReport } from './types.js';
import { loadOptimizerConfig } from './config.js';
import { runAllRules } from './rules/index.js';
import { buildInstancingReport } from './report/builder.js';

export async function detectInstancingCandidates(
  inputPath: string,
): Promise<InstancingReport> {
  const logger = getLogger();
  const config = await loadOptimizerConfig();
  const resolvedPath = resolve(inputPath);

  logger.debug(`Detecting instancing candidates: ${resolvedPath}`);

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
    return buildInstancingReport([], [], []);
  }

  // Enforce maxFiles limit
  if (filePaths.length > config.maxFiles) {
    logger.warn(
      `Found ${filePaths.length} files, truncating to maxFiles limit of ${config.maxFiles}`,
    );
    filePaths = filePaths.slice(0, config.maxFiles);
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

  const { candidates, warnings } = runAllRules(documents, config);
  return buildInstancingReport(documents, warnings, candidates);
}
