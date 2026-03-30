// HostingLint Auto-Analyze
// Unified analysis entry point with platform auto-detection and rule overrides

import { extname } from 'node:path';
import { analyzePhp } from './analyzers/php/index.js';
import { analyzePerl } from './analyzers/perl/index.js';
import { analyzeOpenPanel } from './analyzers/openpanel/index.js';
import type {
  LintResult,
  Platform,
  PhpVersion,
  WhmcsVersion,
  CpanelVersion,
  RuleSeverityOverride,
} from './types.js';

/**
 * Options for analyzeAuto
 */
export interface AnalyzeAutoOptions {
  /** Override auto-detected platform */
  platform?: Platform;
  /** Target PHP version for compatibility checks */
  phpVersion?: PhpVersion;
  /** Target WHMCS version */
  whmcsVersion?: WhmcsVersion;
  /** Target cPanel version */
  cpanelVersion?: CpanelVersion;
  /** Enable security checks */
  security?: boolean;
  /** Enable best practice checks */
  bestPractices?: boolean;
  /** Rule severity overrides (e.g., { 'security-sql-injection': 'off' }) */
  rules?: Record<string, RuleSeverityOverride>;
}

/**
 * Detect platform from file path extension/name
 */
export function detectPlatform(filePath: string): Platform | null {
  const ext = extname(filePath).toLowerCase();
  const fileName = filePath.split('/').pop()?.toLowerCase() ?? '';

  if (ext === '.php') return 'whmcs';
  if (ext === '.pl' || ext === '.pm' || ext === '.cgi') return 'cpanel';
  if (fileName === 'dockerfile' || fileName.startsWith('dockerfile.')) return 'openpanel';
  if (fileName.startsWith('docker-compose') && (ext === '.yml' || ext === '.yaml')) return 'openpanel';
  if (fileName === 'manifest.json') return 'openpanel';

  return null;
}

/**
 * Apply rule severity overrides from config
 *
 * - 'off' removes the result entirely
 * - 'error'/'warning'/'info' changes the severity
 */
export function applyRuleOverrides(
  results: LintResult[],
  ruleOverrides: Record<string, RuleSeverityOverride>,
): LintResult[] {
  if (Object.keys(ruleOverrides).length === 0) return results;

  return results
    .filter((result) => {
      const override = ruleOverrides[result.ruleId];
      return override !== 'off';
    })
    .map((result) => {
      const override = ruleOverrides[result.ruleId];
      if (override && override !== 'off') {
        return { ...result, severity: override };
      }
      return result;
    });
}

/**
 * Unified analysis function with platform auto-detection and rule overrides.
 *
 * Detects the platform from the file extension, dispatches to the appropriate
 * analyzer, and applies rule overrides. Returns an empty array for unsupported files.
 *
 * @param code - Source code content
 * @param filePath - File path (used for platform detection and reporting)
 * @param options - Analysis options
 * @returns Array of lint results
 */
export function analyzeAuto(
  code: string,
  filePath: string,
  options: AnalyzeAutoOptions = {},
): LintResult[] {
  const platform = options.platform ?? detectPlatform(filePath);

  if (!platform) return [];

  const security = options.security ?? true;
  const bestPractices = options.bestPractices ?? true;

  let results: LintResult[];

  switch (platform) {
    case 'whmcs':
      results = analyzePhp(code, filePath, {
        phpVersion: options.phpVersion,
        whmcsVersion: options.whmcsVersion,
        security,
        bestPractices,
      });
      break;
    case 'cpanel':
      results = analyzePerl(code, filePath, {
        cpanelVersion: options.cpanelVersion,
        security,
        bestPractices,
      });
      break;
    case 'openpanel':
      results = analyzeOpenPanel(code, filePath, {
        security,
        bestPractices,
      });
      break;
  }

  if (options.rules) {
    results = applyRuleOverrides(results, options.rules);
  }

  return results;
}
