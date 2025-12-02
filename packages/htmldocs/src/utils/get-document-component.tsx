import * as es from "esbuild";
import fs from "node:fs";
import crypto from "node:crypto";
import { BuildFailure, type OutputFile } from "esbuild";

import {
  ErrorObject,
  configureSourceMap,
  createFakeContext,
  executeBuiltCode,
  extractOutputFiles,
  improveErrorWithSourceMap,
  renderAsync,
} from "htmldocs-v2-render";
import { htmldocsPlugin } from "./htmldocs-esbuild-plugin";
import postCssPlugin from "esbuild-style-plugin";
import { RawSourceMap } from "source-map-js";
import logger from "~/lib/logger";

// Build cache to avoid rebuilding unchanged files
const MAX_CACHE_SIZE = 50;
const buildCache = new Map<string, {
  documentComponent: any;
  documentCss: string | undefined;
  renderAsync: typeof renderAsync;
  sourceMapToOriginalFile: RawSourceMap;
}>();

// CSS cache to avoid re-processing Tailwind when classes haven't changed
const MAX_CSS_CACHE_SIZE = 50;
const cssCache = new Map<string, string>();

// Extract Tailwind classes from file content
const extractTailwindClasses = (content: string): string[] => {
  const classPattern = /className=["']([^"']+)["']/g;
  const classes: Set<string> = new Set();
  
  let match;
  while ((match = classPattern.exec(content)) !== null) {
    const classNames = match[1].split(/\s+/);
    classNames.forEach(cls => classes.add(cls));
  }
  
  return Array.from(classes).sort();
};

// Generate hash from Tailwind classes
const generateCssHash = (classes: string[]): string => {
  const classesString = classes.join(' ');
  return crypto.createHash('md5').update(classesString).digest('hex');
};

export const getDocumentComponent = async (
  documentPath: string
): Promise<
  | {
      documentComponent: any;
      documentCss: string | undefined;
      renderAsync: typeof renderAsync;
      sourceMapToOriginalFile: RawSourceMap;
      fileHash: string;
    }
  | { error: ErrorObject }
> => {
  logger.debug(`[getDocumentComponent] Starting build for: ${documentPath}`);
  const startTime = performance.now();
  
  // Check cache based on file content hash
  let fileContent: string | undefined;
  let hash: string | undefined;
  try {
    fileContent = await fs.promises.readFile(documentPath, 'utf-8');
    hash = crypto.createHash('md5').update(fileContent).digest('hex');
    
    if (buildCache.has(hash)) {
      logger.debug(`[getDocumentComponent] Using cached build for ${documentPath}`);
      const cachedResult = buildCache.get(hash)!;
      const totalTime = performance.now() - startTime;
      logger.debug(`[getDocumentComponent] Cache hit in ${totalTime.toFixed(2)}ms`);
      return {
        ...cachedResult,
        fileHash: hash,
      };
    }
  } catch (cacheError) {
    // If cache check fails, continue with normal build
    logger.debug(`[getDocumentComponent] Cache check failed, proceeding with build`);
  }
  
  // Extract Tailwind classes and check CSS cache
  let cachedCss: string | undefined;
  let cssHash: string | undefined;
  
  if (fileContent) {
    const tailwindClasses = extractTailwindClasses(fileContent);
    cssHash = generateCssHash(tailwindClasses);
    
    if (cssCache.has(cssHash)) {
      cachedCss = cssCache.get(cssHash);
      logger.debug(`[getDocumentComponent] Using cached CSS for hash ${cssHash}`);
    }
  }
  
  let outputFiles: OutputFile[];
  try {
    logger.debug('Starting esbuild');
    const buildStart = performance.now();
    const buildData = await es.build({
      entryPoints: [documentPath],
      platform: "node",
      bundle: true,
      minify: false,
      write: false,
      format: "cjs",
      jsx: "automatic",
      define: {
        "process.env.NODE_ENV": '"development"',
      },
      plugins: [
        htmldocsPlugin([documentPath], false),
        // Only run PostCSS if we don't have cached CSS
        ...(cachedCss 
          ? [] 
          : [postCssPlugin({
              postcss: {
                plugins: [require("tailwindcss"), require("autoprefixer")],
              },
            })]
        ),
      ],
      loader: {
        ".ts": "ts",
        ".tsx": "tsx",
        ".css": "css",
      },
      outdir: "stdout", // stub for esbuild, won't actually write to this folder
      sourcemap: "external",
    });
    const buildTime = performance.now() - buildStart;
    logger.debug('esbuild completed');
    logger.debug(`[getDocumentComponent] Build completed in ${buildTime.toFixed(2)}ms`);
    
    outputFiles = buildData.outputFiles;
  } catch (exp) {
    const buildFailure = exp as BuildFailure;
    logger.error('[getDocumentComponent] Build failed:', {
      error: {
        message: buildFailure.message,
        stack: buildFailure.stack,
        name: buildFailure.name,
        cause: buildFailure.cause,
      },
    });
    return {
      error: {
        message: buildFailure.message,
        stack: buildFailure.stack || new Error().stack,
        name: buildFailure.name,
        cause: buildFailure.cause,
      }
    };
  }

  try {
    logger.debug('Starting post-build processing');
    const postBuildStart = performance.now();
    
    logger.debug('Extracting files');
    const { sourceMapFile, bundledDocumentFile, cssFile } =
      extractOutputFiles(outputFiles);
    logger.debug('Files extracted');
    
    const builtDocumentCode = bundledDocumentFile.text;
    
    // Extract or use cached CSS
    let documentCss: string | undefined;
    
    if (cachedCss) {
      documentCss = cachedCss;
      logger.debug('[getDocumentComponent] Using cached CSS');
    } else {
      documentCss = cssFile?.text;
      
      // Cache the newly generated CSS
      if (documentCss && cssHash) {
        cssCache.set(cssHash, documentCss);
        
        // Limit cache size
        if (cssCache.size > MAX_CSS_CACHE_SIZE) {
          const firstKey = cssCache.keys().next().value;
          if (firstKey) {
            cssCache.delete(firstKey);
          }
        }
        logger.debug(`[getDocumentComponent] Cached CSS with hash ${cssHash}`);
      }
    }
    
    logger.debug('Creating context');
    const fakeContext = createFakeContext(documentPath);
    logger.debug('Context created');
    
    logger.debug('Configuring source map');
    const sourceMapToDocument = configureSourceMap(sourceMapFile);
    logger.debug('Source map configured');

    logger.debug('Executing code');
    const executionResult = executeBuiltCode(
      builtDocumentCode,
      fakeContext,
      documentPath,
      sourceMapToDocument
    );
    logger.debug('Code executed');

    const postBuildTime = performance.now() - postBuildStart;
    logger.debug('Post-build completed');
    logger.debug(`[getDocumentComponent] Post-build processing completed in ${postBuildTime.toFixed(2)}ms`);

    if ("error" in executionResult) {
      logger.error('[getDocumentComponent] Execution failed:', executionResult.error);
      return { error: executionResult.error };
    }

    const totalTime = performance.now() - startTime;
    logger.debug(`[getDocumentComponent] Total processing completed in ${totalTime.toFixed(2)}ms`);

    const cacheableResult = {
      documentComponent: executionResult.DocumentComponent,
      documentCss,
      renderAsync: executionResult.renderAsync,
      sourceMapToOriginalFile: sourceMapToDocument,
    };
    
    const result = {
      ...cacheableResult,
      fileHash: hash!,
    };
    
    // Cache the successful result using the hash computed earlier
    if (hash) {
      buildCache.set(hash, cacheableResult);
      
      // Limit cache size to prevent memory leaks
      if (buildCache.size > MAX_CACHE_SIZE) {
        const firstKey = buildCache.keys().next().value;
        if (firstKey) {
          buildCache.delete(firstKey);
        }
      }
      logger.debug(`[getDocumentComponent] Result cached with hash ${hash}`);
    }

    return result;
  } catch (error) {
    logger.error('[getDocumentComponent] Processing error:', error);
    return {
      error: {
        message: error.message,
        stack: new Error().stack,
        name: "Error",
        cause: error.cause,
      },
    };
  }
};

export interface RenderedDocumentMetadata {
  markup: string;
  reactMarkup: string;
}

export type DocumentRenderingResult =
  | RenderedDocumentMetadata
  | {
      error: ErrorObject;
    };

export const renderDocumentByPath = async (
  documentPath: string
): Promise<DocumentRenderingResult> => {
  const result = await getDocumentComponent(documentPath);

  if ("error" in result) {
    return { error: result.error };
  }

  const {
    documentComponent: Document,
    renderAsync,
    sourceMapToOriginalFile,
  } = result;

  const previewProps = Document.PreviewProps || {};
  const DocumentComponent = Document as React.FC;
  try {
    const markup = await renderAsync(<DocumentComponent {...previewProps} />);

    const reactMarkup = await fs.promises.readFile(documentPath, "utf-8");

    return {
      markup,
      reactMarkup,
    };
  } catch (exception) {
    const error = exception as Error;

    return {
      error: improveErrorWithSourceMap(
        error,
        documentPath,
        sourceMapToOriginalFile
      ),
    };
  }
};

// export const renderCSSBundle = async () => {
//   const cssSrcPath = path.resolve(__dirname, "../src/css/index.css");
//   const outputDirPath = path.resolve(process.cwd(), options.outputDir);
//   await es.build({
//     entryPoints: [cssSrcPath],
//     outdir: outputDirPath,
//     bundle: true,
//     minify: true,
//     plugins: [
//       postCssPlugin({
//         postcss: {
//           plugins: [require('tailwindcss'), require('autoprefixer')],
//         },
//       })
//     ]
//   })
// };

// (async () => {
//   try {
//     const documentPath = options.inputFile;
//     const result = await renderDocumentByPath(documentPath);

//     if ("error" in result) {
//       console.error("Error rendering document:", result.error);
//     } else {
//       console.log("Markup:", result.markup);
//       console.log("React Markup:", result.reactMarkup);

//       const outputFilePath = path.join(options.outputDir, "output.html");
//       await fs.promises.writeFile(outputFilePath, result.markup, "utf-8");
//     }

//     // Render CSS bundle
//     await renderCSSBundle();
//   } catch (error) {
//     console.error("An unexpected error occurred:", error);
//   }
// })();
