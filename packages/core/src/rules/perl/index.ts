// Perl/cPanel Rules - Aggregated exports
// All rules for Perl/cPanel platform analysis

import type { Rule } from '../../types.js';
import { perlBestPracticeRules } from './best-practice.js';
import { perlSecurityRules } from './security.js';
import { perlCompatibilityRules } from './compatibility.js';

// Re-export individual rules
export { perlStrictWarnings, perlErrorHandling } from './best-practice.js';
export { perlTaintCheck, perlFilePermissions, perlInputValidation } from './security.js';
export { perlCpanelApiVersion, perlDeprecatedModules } from './compatibility.js';

// Re-export group arrays
export { perlBestPracticeRules } from './best-practice.js';
export { perlSecurityRules } from './security.js';
export { perlCompatibilityRules } from './compatibility.js';

/** All Perl/cPanel rules combined */
export const perlRules: Rule[] = [
  ...perlBestPracticeRules,
  ...perlSecurityRules,
  ...perlCompatibilityRules,
];
