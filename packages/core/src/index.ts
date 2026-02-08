// HostingLint Core - Public API
// @hostinglint/core - Analysis engine for hosting control panel modules

// Analyzers
export { analyzePhp } from './analyzers/php/index.js';
export { analyzePerl } from './analyzers/perl/index.js';
export { analyzeOpenPanel } from './analyzers/openpanel/index.js';

// Analyzer factory
export { createAnalyzer, isPhpVersionAtLeast, isCpanelVersionAtLeast } from './analyzers/base.js';
export type { BaseAnalyzerOptions, VersionedAnalyzerOptions, AnalyzerFunction } from './analyzers/base.js';

// Rules
export {
  allRules,
  phpRules,
  perlRules,
  openpanelRules,
  crossPlatformRules,
  getRulesByPlatform,
  getRuleById,
  RuleRegistry,
} from './rules/index.js';

// Configuration
export {
  loadConfigFromFile,
  findConfig,
  mergeConfig,
  shouldIgnore,
  validateConfig,
  ConfigValidationError,
} from './config.js';

// Inline Disable
export {
  filterDisabledResults,
  parseDisableDirectives,
} from './inline-disable.js';

// Auto-Fix
export {
  applyFixes,
  getFixableSummary,
} from './fixer.js';
export type { FixResult } from './fixer.js';

// Plugins
export {
  loadPlugin,
  loadPluginsFromConfig,
  registerPluginRules,
  isValidPlugin,
} from './plugins.js';

// Presets
export {
  recommended,
  strict,
  securityOnly,
  presets,
  getPreset,
} from './presets.js';

// Types
export type {
  Platform,
  Severity,
  OutputFormat,
  PhpVersion,
  WhmcsVersion,
  CpanelVersion,
  FixAction,
  LintResult,
  RuleContext,
  PhpAnalyzerOptions,
  PerlAnalyzerOptions,
  OpenPanelAnalyzerOptions,
  AnalyzerOptions,
  Rule,
  LintSummary,
  RuleSeverityOverride,
  HostingLintConfig,
  HostingLintPlugin,
} from './types.js';
