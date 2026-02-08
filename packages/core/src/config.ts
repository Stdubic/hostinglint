// HostingLint Configuration File Loader
// Loads and validates .hostinglintrc.json configuration files

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { HostingLintConfig, RuleSeverityOverride } from './types.js';
import { getPreset } from './presets.js';

/**
 * Default configuration file names to search for (in priority order)
 */
const CONFIG_FILE_NAMES = [
  '.hostinglintrc.json',
  '.hostinglintrc',
  'hostinglint.config.json',
];

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: HostingLintConfig = {
  rules: {},
  ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**'],
  security: true,
  bestPractices: true,
};

/**
 * Valid values for fields that have constrained types
 */
const VALID_PHP_VERSIONS = ['7.4', '8.0', '8.1', '8.2', '8.3', '8.4'];
const VALID_WHMCS_VERSIONS = ['8.11', '8.12', '8.13', '8.14'];
const VALID_CPANEL_VERSIONS = ['v132', 'v133', 'v134', 'v135'];
const VALID_SEVERITY_OVERRIDES = ['off', 'error', 'warning', 'info'];

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  /** Field path that failed validation */
  field: string;

  constructor(field: string, message: string) {
    super(`Invalid config field "${field}": ${message}`);
    this.name = 'ConfigValidationError';
    this.field = field;
  }
}

/**
 * Validate a configuration object shape and values
 *
 * @param config - Raw parsed config object
 * @throws ConfigValidationError if validation fails
 */
export function validateConfig(config: unknown): asserts config is Partial<HostingLintConfig> {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new ConfigValidationError('root', 'Configuration must be a JSON object');
  }

  const obj = config as Record<string, unknown>;

  // Validate phpVersion
  if (obj.phpVersion !== undefined) {
    if (typeof obj.phpVersion !== 'string' || !VALID_PHP_VERSIONS.includes(obj.phpVersion)) {
      throw new ConfigValidationError(
        'phpVersion',
        `Must be one of: ${VALID_PHP_VERSIONS.join(', ')}. Got: "${String(obj.phpVersion)}"`
      );
    }
  }

  // Validate whmcsVersion
  if (obj.whmcsVersion !== undefined) {
    if (typeof obj.whmcsVersion !== 'string' || !VALID_WHMCS_VERSIONS.includes(obj.whmcsVersion)) {
      throw new ConfigValidationError(
        'whmcsVersion',
        `Must be one of: ${VALID_WHMCS_VERSIONS.join(', ')}. Got: "${String(obj.whmcsVersion)}"`
      );
    }
  }

  // Validate cpanelVersion
  if (obj.cpanelVersion !== undefined) {
    if (typeof obj.cpanelVersion !== 'string' || !VALID_CPANEL_VERSIONS.includes(obj.cpanelVersion)) {
      throw new ConfigValidationError(
        'cpanelVersion',
        `Must be one of: ${VALID_CPANEL_VERSIONS.join(', ')}. Got: "${String(obj.cpanelVersion)}"`
      );
    }
  }

  // Validate rules
  if (obj.rules !== undefined) {
    if (typeof obj.rules !== 'object' || obj.rules === null || Array.isArray(obj.rules)) {
      throw new ConfigValidationError('rules', 'Must be an object mapping rule IDs to severity overrides');
    }
    const rules = obj.rules as Record<string, unknown>;
    for (const [ruleId, value] of Object.entries(rules)) {
      if (typeof value !== 'string' || !VALID_SEVERITY_OVERRIDES.includes(value)) {
        throw new ConfigValidationError(
          `rules.${ruleId}`,
          `Must be one of: ${VALID_SEVERITY_OVERRIDES.join(', ')}. Got: "${String(value)}"`
        );
      }
    }
  }

  // Validate ignore
  if (obj.ignore !== undefined) {
    if (!Array.isArray(obj.ignore) || !obj.ignore.every((p: unknown) => typeof p === 'string')) {
      throw new ConfigValidationError('ignore', 'Must be an array of strings (glob patterns)');
    }
  }

  // Validate booleans
  if (obj.security !== undefined && typeof obj.security !== 'boolean') {
    throw new ConfigValidationError('security', 'Must be a boolean');
  }
  if (obj.bestPractices !== undefined && typeof obj.bestPractices !== 'boolean') {
    throw new ConfigValidationError('bestPractices', 'Must be a boolean');
  }

  // Validate plugins
  if (obj.plugins !== undefined) {
    if (!Array.isArray(obj.plugins) || !obj.plugins.every((p: unknown) => typeof p === 'string')) {
      throw new ConfigValidationError('plugins', 'Must be an array of strings (package names or paths)');
    }
  }

  // Validate preset
  if (obj.preset !== undefined) {
    if (typeof obj.preset !== 'string') {
      throw new ConfigValidationError('preset', 'Must be a string');
    }
    if (!getPreset(obj.preset)) {
      throw new ConfigValidationError('preset', `Unknown preset: "${obj.preset}". Available: recommended, strict, security-only`);
    }
  }
}

/**
 * Load configuration from a specific file path with validation
 *
 * @param configPath - Absolute path to the configuration file
 * @returns Parsed and validated configuration object
 * @throws ConfigValidationError if config is invalid
 */
export function loadConfigFromFile(configPath: string): HostingLintConfig {
  let content: string;
  try {
    content = readFileSync(configPath, 'utf-8');
  } catch (error) {
    throw new Error(
      `Cannot read config file "${configPath}": ${error instanceof Error ? error.message : String(error)}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new ConfigValidationError(
      'root',
      `Invalid JSON in "${configPath}": ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Validate the parsed config
  validateConfig(parsed);

  // If a preset is specified, use it as base
  const validConfig = parsed as Partial<HostingLintConfig>;
  let base = DEFAULT_CONFIG;
  if (validConfig.preset) {
    const presetConfig = getPreset(validConfig.preset);
    if (presetConfig) {
      base = { ...DEFAULT_CONFIG, ...presetConfig };
    }
  }

  return mergeConfig(base, validConfig);
}

/**
 * Find and load configuration by searching up the directory tree
 *
 * @param startDir - Directory to start searching from
 * @returns Configuration object (defaults if no config file found)
 */
export function findConfig(startDir: string): HostingLintConfig {
  let currentDir = resolve(startDir);
  const root = dirname(currentDir);

  // Walk up the directory tree looking for config files
  while (currentDir !== root) {
    for (const fileName of CONFIG_FILE_NAMES) {
      const configPath = resolve(currentDir, fileName);
      if (existsSync(configPath)) {
        try {
          return loadConfigFromFile(configPath);
        } catch {
          // Invalid config file, continue searching
        }
      }
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return { ...DEFAULT_CONFIG };
}

/**
 * Merge user config with defaults
 *
 * @param defaults - Default configuration
 * @param overrides - User-provided overrides
 * @returns Merged configuration
 */
export function mergeConfig(
  defaults: HostingLintConfig,
  overrides: Partial<HostingLintConfig>
): HostingLintConfig {
  return {
    rules: { ...defaults.rules, ...(overrides.rules as Record<string, RuleSeverityOverride> | undefined) },
    phpVersion: overrides.phpVersion ?? defaults.phpVersion,
    whmcsVersion: overrides.whmcsVersion ?? defaults.whmcsVersion,
    cpanelVersion: overrides.cpanelVersion ?? defaults.cpanelVersion,
    ignore: overrides.ignore ?? defaults.ignore,
    security: overrides.security ?? defaults.security,
    bestPractices: overrides.bestPractices ?? defaults.bestPractices,
    plugins: overrides.plugins ?? defaults.plugins,
    preset: overrides.preset ?? defaults.preset,
  };
}

/**
 * Check if a file path matches any of the ignore patterns
 *
 * @param filePath - File path to check
 * @param ignorePatterns - Array of glob-like patterns
 * @returns True if the file should be ignored
 */
export function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const pattern of ignorePatterns) {
    const normalizedPattern = pattern.replace(/\\/g, '/');

    // Simple glob matching (supports ** and *)
    if (normalizedPattern.includes('**')) {
      // Convert ** glob to regex
      const regexStr = normalizedPattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/(?<!\.)(\*)/g, '[^/]*');
      const regex = new RegExp(regexStr);
      if (regex.test(normalizedPath)) return true;
    } else if (normalizedPattern.includes('*')) {
      const regexStr = normalizedPattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '[^/]*');
      const regex = new RegExp(regexStr);
      if (regex.test(normalizedPath)) return true;
    } else {
      if (normalizedPath.includes(normalizedPattern)) return true;
    }
  }

  return false;
}
