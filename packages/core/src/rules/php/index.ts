// PHP/WHMCS Rules - Aggregated exports
// All rules for PHP/WHMCS platform analysis

import type { Rule } from '../../types.js';
import { phpCompatibilityRules } from './compatibility.js';
import { phpSecurityRules } from './security.js';
import { whmcsRules } from './whmcs.js';

// Re-export individual rules for direct access
export { phpEachRemoved, phpCreateFunction, phpMysqlFunctions, phpCurlyBraces } from './compatibility.js';
export { phpSqlInjection, phpXss, phpPathTraversal } from './security.js';
export { whmcsMetadata, whmcsDeprecated, whmcsHookErrorHandling, whmcsConfigFunction, whmcsLicenseCheck, whmcsReturnFormat } from './whmcs.js';

// Re-export group arrays
export { phpCompatibilityRules } from './compatibility.js';
export { phpSecurityRules } from './security.js';
export { whmcsRules } from './whmcs.js';

/** All PHP/WHMCS rules combined */
export const phpRules: Rule[] = [
  ...phpCompatibilityRules,
  ...phpSecurityRules,
  ...whmcsRules,
];
