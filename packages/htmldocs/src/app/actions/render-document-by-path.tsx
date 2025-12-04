"use server";

import React from "react";
import fs from "node:fs";
import crypto from "node:crypto";
import { getDocumentComponent } from "../../utils/get-document-component";
import { ErrorObject, improveErrorWithSourceMap } from "htmldocs-v2-render";
import logger from "../lib/logger";
import chalk from "chalk";
import path from "node:path";

export interface RenderedDocumentMetadata {
  markup: string;
  reactMarkup: string;
  previewProps: Record<string, any>;
  timing?: {
    total: number;
    componentLoad: number;
    rendering: number;
    fileRead: number;
  };
}

export type DocumentRenderingResult =
  | RenderedDocumentMetadata
  | {
      error: ErrorObject;
    };

// Rendering cache to avoid re-rendering identical components
const MAX_RENDER_CACHE_SIZE = 100;
const renderCache = new Map<string, RenderedDocumentMetadata>();

const generateRenderCacheKey = (
  documentPath: string,
  fileHash: string,
  props: Record<string, any>,
  cssHash: string,
): string => {
  try {
    const propsJson = JSON.stringify(props, Object.keys(props).sort());
    const propsHash = crypto.createHash("md5").update(propsJson).digest("hex");
    return `${documentPath}:${fileHash}:${propsHash}:${cssHash}`;
  } catch (error) {
    // If props can't be serialized (e.g., circular refs, functions),
    // use a fallback to avoid cache poisoning
    logger.debug(`[render] Failed to serialize props for cache key: ${error}`);
    return `${documentPath}:${fileHash}:no-props:${cssHash}`;
  }
};

// Evict oldest cache entry (FIFO strategy)
const evictOldestCacheEntry = () => {
  if (renderCache.size >= MAX_RENDER_CACHE_SIZE) {
    const firstKey = renderCache.keys().next().value;
    if (firstKey) {
      renderCache.delete(firstKey);
      logger.debug(`[render] Evicted cache entry: ${firstKey}`);
    }
  }
};

export const renderDocumentByPath = async (
  documentPath: string,
  props: Record<string, any> = {},
): Promise<DocumentRenderingResult> => {
  logger.debug(`[render] Starting render for document: ${documentPath}`);
  const startTime = performance.now();

  logger.debug("[render] Loading component...");
  const result = await getDocumentComponent(documentPath);
  const componentLoadTime = performance.now() - startTime;
  logger.debug(
    `[render] Component loaded in ${componentLoadTime.toFixed(2)}ms`,
  );

  if ("error" in result) {
    console.error(chalk.red("[render] Error loading component:"), result.error);
    return { error: result.error };
  }

  const {
    documentComponent: Document,
    documentCss,
    renderAsync,
    sourceMapToOriginalFile,
    fileHash,
  } = result;

  const renderProps =
    Object.keys(props).length !== 0 ? props : Document.PreviewProps || {};

  // Generate cache key
  const cssHash = documentCss
    ? crypto.createHash("md5").update(documentCss).digest("hex")
    : "no-css";
  const cacheKey = generateRenderCacheKey(
    documentPath,
    fileHash,
    renderProps,
    cssHash,
  );

  // Check render cache
  if (renderCache.has(cacheKey)) {
    logger.debug(`[render] Using cached HTML for ${documentPath}`);
    const cachedResult = renderCache.get(cacheKey)!;
    const totalTime = performance.now() - startTime;
    const filename = path.basename(documentPath);
    const formattedTime =
      totalTime >= 1000
        ? chalk.yellow(`${(totalTime / 1000).toFixed(2)}s`)
        : chalk.yellow(`${totalTime.toFixed(2)}ms`);
    console.log(
      `${chalk.green("✔")} Document ${chalk.cyan(filename)} rendered in ${formattedTime} ${chalk.gray("(cached)")}`,
    );
    return cachedResult;
  }

  const DocumentComponent = Document as React.FC;

  try {
    logger.debug("[render] Starting rendering...");
    const renderStart = performance.now();
    const markup = await renderAsync(
      <DocumentComponent {...renderProps} />,
      documentCss,
    );
    const renderTime = performance.now() - renderStart;
    logger.debug(`[render] Rendering completed in ${renderTime.toFixed(2)}ms`);

    logger.debug("[render] Reading file...");
    const fileReadStart = performance.now();
    const reactMarkup = await fs.promises.readFile(documentPath, "utf-8");
    const fileReadTime = performance.now() - fileReadStart;
    logger.debug(`[render] File read in ${fileReadTime.toFixed(2)}ms`);

    const totalTime = performance.now() - startTime;

    const renderedResult: RenderedDocumentMetadata = {
      markup,
      reactMarkup,
      previewProps: Document.PreviewProps,
      timing: {
        total: totalTime,
        componentLoad: componentLoadTime,
        rendering: renderTime,
        fileRead: fileReadTime,
      },
    };

    // Store in cache
    evictOldestCacheEntry();
    renderCache.set(cacheKey, renderedResult);
    logger.debug(`[render] Cached render result with key: ${cacheKey}`);

    logger.debug(`[render] Completed in ${totalTime.toFixed(2)}ms`);
    const filename = path.basename(documentPath);
    const formattedTime =
      totalTime >= 1000
        ? chalk.yellow(`${(totalTime / 1000).toFixed(2)}s`)
        : chalk.yellow(`${totalTime.toFixed(2)}ms`);
    console.log(
      `${chalk.green("✔")} Document ${chalk.cyan(filename)} rendered in ${formattedTime}`,
    );

    return renderedResult;
  } catch (exception) {
    const error = exception as Error;
    const filename = path.basename(documentPath);
    console.error(
      `${chalk.red("✘")} Error during rendering ${chalk.cyan(filename)}:`,
      error,
    );

    return {
      error: improveErrorWithSourceMap(
        error,
        documentPath,
        sourceMapToOriginalFile,
      ),
    };
  }
};
