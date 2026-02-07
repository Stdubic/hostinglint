// HostingLint Core Types
// Shared type definitions for all analyzers and rules

/**
 * Supported hosting platforms
 */
export type Platform = 'whmcs' | 'cpanel' | 'openpanel';

/**
 * Severity levels for lint results
 */
export type Severity = 'error' | 'warning' | 'info';

/**
 * Output format options
 */
export type OutputFormat = 'text' | 'json' | 'sarif';

/**
 * PHP version targets for compatibility checking
 */
export type PhpVersion = '7.4' | '8.0' | '8.1' | '8.2' | '8.3';

/**
 * WHMCS version targets
 */
export type WhmcsVersion = '8.11' | '8.12' | '8.13';

/**
 * cPanel version targets
 */
export type CpanelVersion = 'v132' | 'v133' | 'v134';

/**
 * A single lint finding
 */
export interface LintResult {
  /** File path where the issue was found */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Human-readable description of the issue */
  message: string;
  /** Rule identifier (e.g., 'php-compat', 'whmcs-api', 'security') */
  ruleId: string;
  /** Severity of the finding */
  severity: Severity;
  /** Category for grouping (e.g., 'syntax', 'compatibility', 'security', 'best-practice') */
  category: string;
  /** Optional suggested fix */
  fix?: string;
}

/**
 * Options for the PHP analyzer
 */
export interface PhpAnalyzerOptions {
  /** Target PHP version for compatibility checking */
  phpVersion?: PhpVersion;
  /** Target WHMCS version */
  whmcsVersion?: WhmcsVersion;
  /** Enable security checks */
  security?: boolean;
  /** Enable best practice checks */
  bestPractices?: boolean;
}

/**
 * Options for the Perl analyzer
 */
export interface PerlAnalyzerOptions {
  /** Target cPanel version */
  cpanelVersion?: CpanelVersion;
  /** Enable security checks */
  security?: boolean;
  /** Enable best practice checks */
  bestPractices?: boolean;
}

/**
 * Options for the OpenPanel analyzer
 */
export interface OpenPanelAnalyzerOptions {
  /** Enable security checks */
  security?: boolean;
  /** Enable best practice checks */
  bestPractices?: boolean;
}

/**
 * Combined analyzer options
 */
export interface AnalyzerOptions {
  /** Target platform */
  platform?: Platform;
  /** PHP analyzer options */
  php?: PhpAnalyzerOptions;
  /** Perl analyzer options */
  perl?: PerlAnalyzerOptions;
  /** OpenPanel analyzer options */
  openpanel?: OpenPanelAnalyzerOptions;
  /** Output format */
  format?: OutputFormat;
}

/**
 * A lint rule definition
 */
export interface Rule {
  /** Unique rule identifier */
  id: string;
  /** Human-readable description */
  description: string;
  /** Default severity */
  severity: Severity;
  /** Category for grouping */
  category: string;
  /** Platform this rule applies to */
  platform: Platform | 'all';
  /** Check function: receives code and file path, returns findings */
  check: (code: string, filePath: string) => LintResult[];
}

/**
 * Summary of a lint run across multiple files
 */
export interface LintSummary {
  /** Total number of files checked */
  filesChecked: number;
  /** Total number of errors */
  errors: number;
  /** Total number of warnings */
  warnings: number;
  /** Total number of info messages */
  infos: number;
  /** Results grouped by file */
  results: Map<string, LintResult[]>;
}
