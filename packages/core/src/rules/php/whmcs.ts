// WHMCS-Specific Rules
// Rules for WHMCS module conventions, APIs, and best practices

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect missing MetaData function in WHMCS modules (required since WHMCS 8.0)
 */
export const whmcsMetadata: Rule = {
  id: 'whmcs-metadata',
  description: 'WHMCS modules should include a MetaData() function (required since WHMCS 8.0).',
  severity: 'warning',
  category: 'compatibility',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    if (!filePath.endsWith('.php')) return results;

    const hasMetaData = /function\s+\w*_MetaData\s*\(/.test(code) ||
                        /function\s+MetaData\s*\(/.test(code);

    if (!hasMetaData) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Missing MetaData() function. WHMCS 8.0+ requires modules to define a MetaData function.',
        ruleId: 'whmcs-metadata',
        severity: 'warning',
        category: 'compatibility',
        fix: 'Add a function yourmodule_MetaData() { return [...]; } to your module.',
      });
    }

    return results;
  },
};

/**
 * Rule: Detect deprecated WHMCS functions
 */
export const whmcsDeprecated: Rule = {
  id: 'whmcs-deprecated',
  description: 'Usage of deprecated WHMCS function.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    const deprecatedFunctions: Record<string, string> = {
      'getClientsDetails': 'Use GetClientsDetails via localAPI() instead.',
      'select_query': 'Use WHMCS Capsule ORM (\\WHMCS\\Database\\Capsule) instead.',
      'update_query': 'Use WHMCS Capsule ORM (\\WHMCS\\Database\\Capsule) instead.',
      'insert_query': 'Use WHMCS Capsule ORM (\\WHMCS\\Database\\Capsule) instead.',
      'full_query': 'Use WHMCS Capsule ORM (\\WHMCS\\Database\\Capsule) instead.',
    };

    for (let i = 0; i < lines.length; i++) {
      for (const [func, suggestion] of Object.entries(deprecatedFunctions)) {
        const regex = new RegExp(`\\b${func}\\s*\\(`);
        const match = lines[i].match(regex);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `Deprecated WHMCS function: ${func}(). ${suggestion}`,
            ruleId: 'whmcs-deprecated',
            severity: 'warning',
            category: 'compatibility',
            fix: suggestion,
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Check for missing error handling in WHMCS hook callbacks
 */
export const whmcsHookErrorHandling: Rule = {
  id: 'whmcs-hook-error-handling',
  description: 'WHMCS hook callback should include error handling.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/add_hook\s*\(/);
      if (match && match.index !== undefined) {
        const hookBlock = lines.slice(i, Math.min(i + 20, lines.length)).join('\n');
        if (!hookBlock.includes('try') && !hookBlock.includes('catch')) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Hook callback should include try/catch error handling to prevent silent failures.',
            ruleId: 'whmcs-hook-error-handling',
            severity: 'warning',
            category: 'best-practice',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect missing _Config() function in WHMCS provisioning modules
 */
export const whmcsConfigFunction: Rule = {
  id: 'whmcs-config-function',
  description: 'WHMCS provisioning modules should include a _Config() function.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    if (!filePath.endsWith('.php')) return results;

    const isProvisioningModule = /function\s+\w+_(?:CreateAccount|SuspendAccount|UnsuspendAccount|TerminateAccount)\s*\(/.test(code);

    if (isProvisioningModule) {
      const hasConfig = /function\s+\w+_Config\s*\(/.test(code);
      if (!hasConfig) {
        results.push({
          file: filePath,
          line: 1,
          column: 1,
          message: 'Missing _Config() function. WHMCS provisioning modules must define a configuration function.',
          ruleId: 'whmcs-config-function',
          severity: 'warning',
          category: 'compatibility',
          fix: 'Add a function yourmodule_Config() { return array(...); } to define module configuration fields.',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect modules missing license validation
 */
export const whmcsLicenseCheck: Rule = {
  id: 'whmcs-license-check',
  description: 'WHMCS commercial modules should include license validation.',
  severity: 'info',
  category: 'best-practice',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    if (!filePath.endsWith('.php')) return results;

    const isModule = /function\s+\w+_(?:Config|MetaData)\s*\(/.test(code);
    if (!isModule) return results;

    const hasLicenseCheck = /localAPI\s*\(\s*['"]LicensingAddon['"]/ .test(code) ||
      /\$_SERVER\s*\[\s*['"]SERVER_NAME['"]\s*\]/.test(code) ||
      /license/i.test(code);

    if (!hasLicenseCheck) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'No license validation detected. Consider adding license checks for commercial modules.',
        ruleId: 'whmcs-license-check',
        severity: 'info',
        category: 'best-practice',
        fix: 'Add license validation using WHMCS Licensing Addon API or custom license server.',
      });
    }

    return results;
  },
};

/**
 * Rule: Check WHMCS functions return expected array format
 */
export const whmcsReturnFormat: Rule = {
  id: 'whmcs-return-format',
  description: 'WHMCS module functions should return proper result arrays.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    const statusFunctions = [
      'CreateAccount', 'SuspendAccount', 'UnsuspendAccount',
      'TerminateAccount', 'ChangePassword', 'ChangePackage',
      'RenewAccount',
    ];

    for (const func of statusFunctions) {
      const funcRegex = new RegExp(`function\\s+\\w+_${func}\\s*\\(`);
      const funcMatch = code.match(funcRegex);
      if (funcMatch) {
        const funcIndex = code.indexOf(funcMatch[0]);
        const funcBody = code.substring(funcIndex, funcIndex + 2000);

        const hasSuccess = /return\s+['"]success['"]/.test(funcBody);
        const hasResultArray = /['"]result['"]\s*=>\s*['"](?:success|error)['"]/.test(funcBody);

        if (!hasSuccess && !hasResultArray) {
          const lineNumber = code.substring(0, funcIndex).split('\n').length;
          results.push({
            file: filePath,
            line: lineNumber,
            column: 1,
            message: `WHMCS ${func}() should return 'success' string or array with 'result' key.`,
            ruleId: 'whmcs-return-format',
            severity: 'warning',
            category: 'best-practice',
            fix: `Return 'success' for successful operations or array('result' => 'error', 'message' => '...') for failures.`,
          });
        }
      }
    }

    return results;
  },
};

/** All WHMCS-specific rules */
export const whmcsRules: Rule[] = [
  whmcsMetadata,
  whmcsDeprecated,
  whmcsHookErrorHandling,
  whmcsConfigFunction,
  whmcsLicenseCheck,
  whmcsReturnFormat,
];
