// HostingLint BaseAnalyzer Factory
// Eliminates duplication across platform analyzers by providing a shared
// analysis pipeline: rule filtering → execution → inline disable → sorting

import type {
  LintResult,
  Rule,
  RuleContext,
  PhpVersion,
  WhmcsVersion,
  CpanelVersion,
} from '../types.js';
import { filterDisabledResults } from '../inline-disable.js';
import { RuleRegistry } from '../rules/registry.js';

/**
 * Base options shared by all analyzers
 */
export interface BaseAnalyzerOptions {
  /** Enable security checks */
  security?: boolean;
  /** Enable best practice checks */
  bestPractices?: boolean;
}

/**
 * Extended options with version targeting
 */
export interface VersionedAnalyzerOptions extends BaseAnalyzerOptions {
  phpVersion?: PhpVersion;
  whmcsVersion?: WhmcsVersion;
  cpanelVersion?: CpanelVersion;
}

/**
 * Version filter function signature
 * Returns true if the rule should be INCLUDED for the given options
 */
type VersionFilter<T extends BaseAnalyzerOptions> = (rule: Rule, options: T) => boolean;

/**
 * Ordered version arrays for comparison
 */
const PHP_VERSION_ORDER: PhpVersion[] = ['7.4', '8.0', '8.1', '8.2', '8.3', '8.4'];
const CPANEL_VERSION_ORDER: CpanelVersion[] = ['v132', 'v133', 'v134', 'v135'];

/**
 * Compare two PHP version strings
 * Returns true if targetVersion >= requiredVersion
 */
export function isPhpVersionAtLeast(targetVersion: PhpVersion, requiredVersion: PhpVersion): boolean {
  return PHP_VERSION_ORDER.indexOf(targetVersion) >= PHP_VERSION_ORDER.indexOf(requiredVersion);
}

/**
 * Compare two cPanel version strings
 * Returns true if targetVersion >= requiredVersion
 */
export function isCpanelVersionAtLeast(targetVersion: CpanelVersion, requiredVersion: CpanelVersion): boolean {
  return CPANEL_VERSION_ORDER.indexOf(targetVersion) >= CPANEL_VERSION_ORDER.indexOf(requiredVersion);
}

/**
 * Filter rules based on category options and optional version filter
 */
function filterRules<T extends BaseAnalyzerOptions>(
  rules: Rule[],
  options: T,
  versionFilter?: VersionFilter<T>,
): Rule[] {
  return rules.filter((rule) => {
    // Filter by category
    if (rule.category === 'security' && !options.security) return false;
    if (rule.category === 'best-practice' && !options.bestPractices) return false;

    // Apply version-specific filtering
    if (versionFilter && !versionFilter(rule, options)) return false;

    return true;
  });
}

/**
 * Build a RuleContext from code, filePath, and options
 */
function buildContext(
  code: string,
  filePath: string,
  options: VersionedAnalyzerOptions,
): RuleContext {
  return {
    code,
    filePath,
    lines: code.split('\n'),
    config: {
      phpVersion: options.phpVersion,
      whmcsVersion: options.whmcsVersion,
      cpanelVersion: options.cpanelVersion,
      security: options.security,
      bestPractices: options.bestPractices,
    },
    phpVersion: options.phpVersion,
    whmcsVersion: options.whmcsVersion,
    cpanelVersion: options.cpanelVersion,
  };
}

/**
 * Analyzer function signature
 */
export type AnalyzerFunction<T extends BaseAnalyzerOptions> = (
  code: string,
  filePath: string,
  options?: T,
) => LintResult[];

/**
 * Create a platform-specific analyzer function.
 *
 * This factory eliminates duplication across PHP, Perl, and OpenPanel analyzers
 * by encapsulating the shared pipeline: rule filtering → execution → inline disable → sort.
 *
 * @param platformRules - Rules specific to this platform
 * @param crossPlatformRules - Rules that apply to all platforms
 * @param defaultOptions - Default option values for this analyzer
 * @param versionFilter - Optional version-based rule filtering
 * @returns An analyzer function
 */
export function createAnalyzer<T extends BaseAnalyzerOptions>(
  platformRules: Rule[],
  crossPlatformRules: Rule[],
  defaultOptions: T,
  versionFilter?: VersionFilter<T>,
): AnalyzerFunction<T> {
  return (code: string, filePath: string, options: T = {} as T): LintResult[] => {
    const opts = { ...defaultOptions, ...options };

    // Combine platform and cross-platform rules
    const allApplicable = [...platformRules, ...crossPlatformRules];

    // Filter rules based on options and version constraints
    const rules = filterRules(allApplicable, opts, versionFilter);

    // Build context for rule execution
    const context = buildContext(code, filePath, opts as unknown as VersionedAnalyzerOptions);

    // Execute rules and collect results
    const results: LintResult[] = [];
    for (const rule of rules) {
      const findings = RuleRegistry.runRule(rule, context);
      results.push(...findings);
    }

    // Filter results based on inline disable comments
    const filtered = filterDisabledResults(results, code);

    // Sort by line number, then column
    filtered.sort((a, b) => a.line - b.line || a.column - b.column);

    return filtered;
  };
}
