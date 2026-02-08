// HostingLint OpenPanel Analyzer
// Validates OpenPanel extensions (Docker-based) for compatibility and best practices

import type { OpenPanelAnalyzerOptions } from '../../types.js';
import { openpanelRules } from '../../rules/openpanel/index.js';
import { crossPlatformRules } from '../../rules/common/index.js';
import { createAnalyzer } from '../base.js';

/**
 * Default OpenPanel analyzer options
 */
const DEFAULT_OPTIONS: OpenPanelAnalyzerOptions = {
  security: true,
  bestPractices: true,
};

/**
 * Analyze OpenPanel extension files
 *
 * @param code - Source code or Dockerfile content to analyze
 * @param filePath - Path to the file being analyzed (for reporting)
 * @param options - OpenPanel analyzer options
 * @returns Array of lint results
 */
export const analyzeOpenPanel = createAnalyzer<OpenPanelAnalyzerOptions>(
  openpanelRules,
  crossPlatformRules,
  DEFAULT_OPTIONS,
);
