// HostingLint Perl Analyzer
// Validates cPanel plugins (Perl) for syntax, compatibility, security, and best practices

import type { LintResult, PerlAnalyzerOptions, Rule } from '../../types.js';
import { perlRules } from '../../rules/index.js';

/**
 * Default Perl analyzer options
 */
const DEFAULT_OPTIONS: PerlAnalyzerOptions = {
  cpanelVersion: 'v134',
  security: true,
  bestPractices: true,
};

/**
 * Analyze Perl code for cPanel plugin issues
 *
 * @param code - Perl source code to analyze
 * @param filePath - Path to the file being analyzed (for reporting)
 * @param options - Perl analyzer options
 * @returns Array of lint results
 */
export function analyzePerl(
  code: string,
  filePath: string,
  options: PerlAnalyzerOptions = {}
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
function getApplicableRules(options: PerlAnalyzerOptions): Rule[] {
  return perlRules.filter((rule) => {
    if (rule.category === 'security' && !options.security) return false;
    if (rule.category === 'best-practice' && !options.bestPractices) return false;
    return true;
  });
}
