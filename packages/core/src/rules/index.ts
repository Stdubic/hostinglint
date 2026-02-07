// HostingLint Rule Registry
// Central registry for all lint rules across platforms

import type { LintResult, Rule } from '../types.js';

// =============================================================================
// PHP Rules (WHMCS)
// =============================================================================

/**
 * Rule: Detect usage of `each()` which was removed in PHP 8.0
 */
const phpEachRemoved: Rule = {
  id: 'php-compat-each',
  description: 'each() was removed in PHP 8.0. Use foreach() instead.',
  severity: 'error',
  category: 'compatibility',
  platform: 'whmcs',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      // Match each() function calls but not forEach or other *each* functions
      const match = lines[i].match(/\beach\s*\(/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'each() was removed in PHP 8.0. Use foreach() or array key/value functions instead.',
          ruleId: 'php-compat-each',
          severity: 'error',
          category: 'compatibility',
          fix: 'Replace each($array) with foreach($array as $key => $value)',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect missing MetaData function in WHMCS modules (required since WHMCS 8.0)
 */
const whmcsMetadata: Rule = {
  id: 'whmcs-metadata',
  description: 'WHMCS modules should include a MetaData() function (required since WHMCS 8.0).',
  severity: 'warning',
  category: 'compatibility',
  platform: 'whmcs',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];

    // Only check main module files (not hooks or other helpers)
    if (!filePath.endsWith('.php')) return results;

    // Check if the code contains a MetaData function definition
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
 * Rule: Detect potential SQL injection via unsanitized input
 */
const phpSqlInjection: Rule = {
  id: 'security-sql-injection',
  description: 'Potential SQL injection: user input used directly in SQL query.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect direct variable interpolation in SQL-like strings
      const sqlPatterns = [
        /(?:mysql_query|mysqli_query|->query)\s*\([^)]*\$(?:_GET|_POST|_REQUEST|params)/,
        /(?:SELECT|INSERT|UPDATE|DELETE|WHERE).*\$(?:_GET|_POST|_REQUEST|params)\[/i,
      ];

      for (const pattern of sqlPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Potential SQL injection: user input variable used directly in SQL query. Use parameterized queries or WHMCS Capsule ORM.',
            ruleId: 'security-sql-injection',
            severity: 'error',
            category: 'security',
            fix: 'Use WHMCS Capsule ORM or PDO prepared statements instead of direct variable interpolation.',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect deprecated WHMCS functions
 */
const whmcsDeprecated: Rule = {
  id: 'whmcs-deprecated',
  description: 'Usage of deprecated WHMCS function.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'whmcs',
  check: (code: string, filePath: string): LintResult[] => {
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
const whmcsHookErrorHandling: Rule = {
  id: 'whmcs-hook-error-handling',
  description: 'WHMCS hook callback should include error handling.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'whmcs',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      // Detect add_hook calls
      const match = lines[i].match(/add_hook\s*\(/);
      if (match && match.index !== undefined) {
        // Look ahead for try/catch within the next ~20 lines
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

// =============================================================================
// Perl Rules (cPanel)
// =============================================================================

/**
 * Rule: Check for missing strict/warnings pragmas
 */
const perlStrictWarnings: Rule = {
  id: 'perl-strict-warnings',
  description: 'Perl scripts should use strict and warnings.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'cpanel',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];

    if (!code.includes('use strict')) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Missing "use strict;" pragma. All cPanel plugins should use strict mode.',
        ruleId: 'perl-strict-warnings',
        severity: 'warning',
        category: 'best-practice',
        fix: 'Add "use strict;" near the top of the file.',
      });
    }

    if (!code.includes('use warnings')) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Missing "use warnings;" pragma. All cPanel plugins should enable warnings.',
        ruleId: 'perl-strict-warnings',
        severity: 'warning',
        category: 'best-practice',
        fix: 'Add "use warnings;" near the top of the file.',
      });
    }

    return results;
  },
};

/**
 * Rule: Detect potential taint issues in Perl
 */
const perlTaintCheck: Rule = {
  id: 'perl-security-taint',
  description: 'Potential use of untainted external input.',
  severity: 'error',
  category: 'security',
  platform: 'cpanel',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect system/exec/backtick calls with variables
      const dangerousPatterns = [
        { pattern: /\bsystem\s*\(.*\$/, msg: 'system() call with variable input' },
        { pattern: /\bexec\s*\(.*\$/, msg: 'exec() call with variable input' },
        { pattern: /`[^`]*\$[^`]*`/, msg: 'Backtick execution with variable input' },
        { pattern: /\bopen\s*\(.*\|/, msg: 'open() with pipe (potential command injection)' },
      ];

      for (const { pattern, msg } of dangerousPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `Potential security issue: ${msg}. Validate and sanitize all external input.`,
            ruleId: 'perl-security-taint',
            severity: 'error',
            category: 'security',
          });
        }
      }
    }

    return results;
  },
};

// =============================================================================
// OpenPanel Rules
// =============================================================================

/**
 * Rule: Check Dockerfile best practices for OpenPanel extensions
 */
const openpanelDockerfile: Rule = {
  id: 'openpanel-dockerfile',
  description: 'OpenPanel Dockerfile should follow best practices.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'openpanel',
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];

    if (!filePath.toLowerCase().includes('dockerfile')) return results;

    const lines = code.split('\n');

    // Check for running as root
    const hasUser = lines.some((line) => /^USER\s+/i.test(line.trim()));
    if (!hasUser) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Dockerfile does not set a non-root USER. OpenPanel extensions should not run as root.',
        ruleId: 'openpanel-dockerfile',
        severity: 'warning',
        category: 'best-practice',
        fix: 'Add a USER directive to run as a non-root user.',
      });
    }

    // Check for HEALTHCHECK
    const hasHealthcheck = lines.some((line) => /^HEALTHCHECK\s+/i.test(line.trim()));
    if (!hasHealthcheck) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Dockerfile does not define a HEALTHCHECK. OpenPanel uses health checks for extension monitoring.',
        ruleId: 'openpanel-dockerfile',
        severity: 'info',
        category: 'best-practice',
      });
    }

    return results;
  },
};

// =============================================================================
// Rule Registry
// =============================================================================

/** All PHP/WHMCS rules */
export const phpRules: Rule[] = [
  phpEachRemoved,
  whmcsMetadata,
  phpSqlInjection,
  whmcsDeprecated,
  whmcsHookErrorHandling,
];

/** All Perl/cPanel rules */
export const perlRules: Rule[] = [
  perlStrictWarnings,
  perlTaintCheck,
];

/** All OpenPanel rules */
export const openpanelRules: Rule[] = [
  openpanelDockerfile,
];

/** All rules across all platforms */
export const allRules: Rule[] = [
  ...phpRules,
  ...perlRules,
  ...openpanelRules,
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
