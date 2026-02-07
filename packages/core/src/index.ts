// HostingLint Core - Public API
// @hostinglint/core - Analysis engine for hosting control panel modules

export { analyzePhp } from './analyzers/php/index.js';
export { analyzePerl } from './analyzers/perl/index.js';
export { analyzeOpenPanel } from './analyzers/openpanel/index.js';

export {
  allRules,
  phpRules,
  perlRules,
  openpanelRules,
  getRulesByPlatform,
  getRuleById,
} from './rules/index.js';

export type {
  Platform,
  Severity,
  OutputFormat,
  PhpVersion,
  WhmcsVersion,
  CpanelVersion,
  LintResult,
  PhpAnalyzerOptions,
  PerlAnalyzerOptions,
  OpenPanelAnalyzerOptions,
  AnalyzerOptions,
  Rule,
  LintSummary,
} from './types.js';
