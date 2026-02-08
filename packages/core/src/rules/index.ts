// HostingLint Rule Registry
// Backward-compatible re-export of all rules from modular structure
//
// Rules are now organized in platform-specific modules:
//   - rules/php/      — PHP/WHMCS rules
//   - rules/perl/     — Perl/cPanel rules
//   - rules/openpanel/ — OpenPanel rules
//   - rules/common/   — Cross-platform rules
//   - rules/registry.ts — RuleRegistry class

import type { Rule } from '../types.js';

// Re-export platform rule arrays (backward compatible)
export { phpRules } from './php/index.js';
export { perlRules } from './perl/index.js';
export { openpanelRules } from './openpanel/index.js';
export { crossPlatformRules } from './common/index.js';

// Re-export registry
export { RuleRegistry } from './registry.js';

// Import for aggregation
import { phpRules } from './php/index.js';
import { perlRules } from './perl/index.js';
import { openpanelRules } from './openpanel/index.js';
import { crossPlatformRules } from './common/index.js';

/** All rules across all platforms */
export const allRules: Rule[] = [
  ...phpRules,
  ...perlRules,
  ...openpanelRules,
  ...crossPlatformRules,
];

/**
 * Get rules by platform
 */
export function getRulesByPlatform(platform: string): Rule[] {
  return allRules.filter(
    (rule) => rule.platform === platform || rule.platform === 'all'
  );
}

/**
 * Get a rule by its ID
 */
export function getRuleById(id: string): Rule | undefined {
  return allRules.find((rule) => rule.id === id);
}
