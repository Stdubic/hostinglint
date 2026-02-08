// HostingLint Perl Analyzer
// Validates cPanel plugins (Perl) for syntax, compatibility, security, and best practices

import type { PerlAnalyzerOptions, Rule } from '../../types.js';
import { perlRules } from '../../rules/perl/index.js';
import { crossPlatformRules } from '../../rules/common/index.js';
import { createAnalyzer, isCpanelVersionAtLeast } from '../base.js';

/**
 * Default Perl analyzer options
 */
const DEFAULT_OPTIONS: PerlAnalyzerOptions = {
  cpanelVersion: 'v134',
  security: true,
  bestPractices: true,
};

/**
 * cPanel version filter: only run version-specific rules if targeting that version or higher
 */
function cpanelVersionFilter(rule: Rule, options: PerlAnalyzerOptions): boolean {
  const targetCpanelVersion = options.cpanelVersion ?? 'v134';
  if (rule.minCpanelVersion && !isCpanelVersionAtLeast(targetCpanelVersion, rule.minCpanelVersion)) {
    return false;
  }
  return true;
}

/**
 * Analyze Perl code for cPanel plugin issues
 *
 * @param code - Perl source code to analyze
 * @param filePath - Path to the file being analyzed (for reporting)
 * @param options - Perl analyzer options
 * @returns Array of lint results
 */
export const analyzePerl = createAnalyzer<PerlAnalyzerOptions>(
  perlRules,
  crossPlatformRules,
  DEFAULT_OPTIONS,
  cpanelVersionFilter,
);
