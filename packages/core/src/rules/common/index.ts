// Cross-Platform Rules - Aggregated exports
// Rules that apply to all platforms

import type { Rule } from '../../types.js';
import { commonSecurityRules } from './security.js';
import { commonBestPracticeRules } from './best-practice.js';

// Re-export individual rules
export { securityHardcodedCredentials, securityEvalUsage } from './security.js';
export { bestPracticeTodoFixme } from './best-practice.js';

// Re-export group arrays
export { commonSecurityRules } from './security.js';
export { commonBestPracticeRules } from './best-practice.js';

/** All cross-platform rules combined */
export const crossPlatformRules: Rule[] = [
  ...commonSecurityRules,
  ...commonBestPracticeRules,
];
