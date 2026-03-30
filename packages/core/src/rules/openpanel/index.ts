// OpenPanel Rules - Aggregated exports
// All rules for OpenPanel platform analysis

import type { Rule } from '../../types.js';
import { openpanelDockerRules } from './docker.js';
import { openpanelSecurityRules } from './security.js';
import { openpanelCompatibilityRules } from './compatibility.js';

// Re-export individual rules
export { openpanelDockerfile, openpanelResourceLimits } from './docker.js';
export { openpanelSecurityCapabilities, openpanelCliValidation, openpanelSecurityHostNetwork, openpanelSecuritySecretsInEnv } from './security.js';
export { openpanelApiVersioning } from './compatibility.js';

// Re-export group arrays
export { openpanelDockerRules } from './docker.js';
export { openpanelSecurityRules } from './security.js';
export { openpanelCompatibilityRules } from './compatibility.js';

/** All OpenPanel rules combined */
export const openpanelRules: Rule[] = [
  ...openpanelDockerRules,
  ...openpanelSecurityRules,
  ...openpanelCompatibilityRules,
];
