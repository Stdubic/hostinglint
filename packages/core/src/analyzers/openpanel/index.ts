// HostingLint OpenPanel Analyzer
// Validates OpenPanel extensions (Docker-based) for compatibility and best practices

import type { LintResult, OpenPanelAnalyzerOptions, Rule } from '../../types.js';
import { openpanelRules } from '../../rules/index.js';

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
export function analyzeOpenPanel(
  code: string,
  filePath: string,
  options: OpenPanelAnalyzerOptions = {}
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
function getApplicableRules(options: OpenPanelAnalyzerOptions): Rule[] {
  return openpanelRules.filter((rule) => {
    if (rule.category === 'security' && !options.security) return false;
    if (rule.category === 'best-practice' && !options.bestPractices) return false;
    return true;
  });
}
