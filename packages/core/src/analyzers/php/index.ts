// HostingLint PHP Analyzer
// Validates WHMCS modules (PHP) for syntax, compatibility, security, and best practices

import type { LintResult, PhpAnalyzerOptions, Rule } from '../../types.js';
import { phpRules } from '../../rules/index.js';

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
 * Analyze PHP code for WHMCS module issues
 *
 * @param code - PHP source code to analyze
 * @param filePath - Path to the file being analyzed (for reporting)
 * @param options - PHP analyzer options
 * @returns Array of lint results
 */
export function analyzePhp(
  code: string,
  filePath: string,
  options: PhpAnalyzerOptions = {}
): LintResult[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const results: LintResult[] = [];

  // Get applicable rules
  const rules = getApplicableRules(opts);

  // Run each rule against the code
  for (const rule of rules) {
    const findings = rule.check(code, filePath);
    results.push(...findings);
  }

  // Sort by line number
  results.sort((a, b) => a.line - b.line || a.column - b.column);

  return results;
}

/**
 * Get rules applicable to the current options
 */
function getApplicableRules(options: PhpAnalyzerOptions): Rule[] {
  return phpRules.filter((rule) => {
    // Filter by category based on options
    if (rule.category === 'security' && !options.security) return false;
    if (rule.category === 'best-practice' && !options.bestPractices) return false;
    return true;
  });
}
