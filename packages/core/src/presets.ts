// HostingLint Configuration Presets
// Pre-configured rule sets for common use cases

import type { HostingLintConfig } from './types.js';

/**
 * Recommended preset — balanced configuration suitable for most projects.
 * Enables all rules at their default severity levels.
 */
export const recommended: HostingLintConfig = {
  rules: {},
  phpVersion: '8.3',
  whmcsVersion: '8.13',
  cpanelVersion: 'v134',
  ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**'],
  security: true,
  bestPractices: true,
};

/**
 * Strict preset — all rules enabled, info rules promoted to warnings.
 * Suitable for CI pipelines and quality-conscious teams.
 */
export const strict: HostingLintConfig = {
  rules: {
    'whmcs-license-check': 'warning',
    'best-practice-todo-fixme': 'warning',
  },
  phpVersion: '8.4',
  whmcsVersion: '8.14',
  cpanelVersion: 'v135',
  ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**'],
  security: true,
  bestPractices: true,
};

/**
 * Security-only preset — only security rules are enabled.
 * Useful for quick security audits without noise from other categories.
 */
export const securityOnly: HostingLintConfig = {
  rules: {
    // Disable non-security rules
    'whmcs-metadata': 'off',
    'whmcs-deprecated': 'off',
    'whmcs-hook-error-handling': 'off',
    'whmcs-config-function': 'off',
    'whmcs-license-check': 'off',
    'whmcs-return-format': 'off',
    'perl-strict-warnings': 'off',
    'perl-error-handling': 'off',
    'perl-cpanel-api-version': 'off',
    'perl-deprecated-modules': 'off',
    'openpanel-dockerfile': 'off',
    'openpanel-resource-limits': 'off',
    'openpanel-api-versioning': 'off',
    'best-practice-todo-fixme': 'off',
  },
  security: true,
  bestPractices: false,
};

/**
 * All available presets
 */
export const presets: Record<string, HostingLintConfig> = {
  recommended,
  strict,
  'security-only': securityOnly,
};

/**
 * Get a preset configuration by name
 *
 * @param name - Preset name ('recommended', 'strict', 'security-only')
 * @returns Preset configuration or undefined if not found
 */
export function getPreset(name: string): HostingLintConfig | undefined {
  return presets[name];
}
