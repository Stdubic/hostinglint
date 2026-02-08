// HostingLint PHP Analyzer
// Validates WHMCS modules (PHP) for syntax, compatibility, security, and best practices

import type { PhpAnalyzerOptions, Rule } from '../../types.js';
import { phpRules } from '../../rules/php/index.js';
import { crossPlatformRules } from '../../rules/common/index.js';
import { createAnalyzer, isPhpVersionAtLeast } from '../base.js';

/**
 * Default PHP analyzer options
 */
const DEFAULT_OPTIONS: PhpAnalyzerOptions = {
  phpVersion: '8.3',
  whmcsVersion: '8.13',
  security: true,
  bestPractices: true,
};

/**
 * PHP version filter: only run version-specific rules if targeting that version or higher
 */
function phpVersionFilter(rule: Rule, options: PhpAnalyzerOptions): boolean {
  const targetPhpVersion = options.phpVersion ?? '8.3';
  if (rule.minPhpVersion && !isPhpVersionAtLeast(targetPhpVersion, rule.minPhpVersion)) {
    return false;
  }
  return true;
}

/**
 * Analyze PHP code for WHMCS module issues
 *
 * @param code - PHP source code to analyze
 * @param filePath - Path to the file being analyzed (for reporting)
 * @param options - PHP analyzer options
 * @returns Array of lint results
 */
export const analyzePhp = createAnalyzer<PhpAnalyzerOptions>(
  phpRules,
  crossPlatformRules,
  DEFAULT_OPTIONS,
  phpVersionFilter,
);
