// PHP Compatibility Rules
// Rules for detecting PHP version compatibility issues in WHMCS modules

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect usage of `each()` which was removed in PHP 8.0
 */
export const phpEachRemoved: Rule = {
  id: 'php-compat-each',
  description: 'each() was removed in PHP 8.0. Use foreach() instead.',
  severity: 'error',
  category: 'compatibility',
  platform: 'whmcs',
  minPhpVersion: '8.0',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
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
          fixAction: {
            range: {
              startLine: i + 1,
              startCol: match.index + 1,
              endLine: i + 1,
              endCol: match.index + 1 + match[0].length,
            },
            replacement: 'foreach(',
            description: 'Replace each() with foreach()',
          },
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect usage of `create_function()` which was removed in PHP 8.0
 */
export const phpCreateFunction: Rule = {
  id: 'php-compat-create-function',
  description: 'create_function() was removed in PHP 8.0. Use anonymous functions instead.',
  severity: 'error',
  category: 'compatibility',
  platform: 'whmcs',
  minPhpVersion: '8.0',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/\bcreate_function\s*\(/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'create_function() was removed in PHP 8.0. Use anonymous functions (closures) instead.',
          ruleId: 'php-compat-create-function',
          severity: 'error',
          category: 'compatibility',
          fix: 'Replace create_function(\'$a,$b\', \'return $a + $b;\') with function($a, $b) { return $a + $b; }',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect usage of `mysql_*` functions removed in PHP 7.0
 */
export const phpMysqlFunctions: Rule = {
  id: 'php-compat-mysql-functions',
  description: 'mysql_* functions were removed in PHP 7.0. Use mysqli_* or PDO instead.',
  severity: 'error',
  category: 'compatibility',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    const deprecatedMysqlFunctions = [
      'mysql_connect', 'mysql_close', 'mysql_select_db', 'mysql_query',
      'mysql_fetch_array', 'mysql_fetch_assoc', 'mysql_fetch_row',
      'mysql_num_rows', 'mysql_affected_rows', 'mysql_real_escape_string',
      'mysql_error', 'mysql_result', 'mysql_free_result', 'mysql_pconnect',
    ];

    for (let i = 0; i < lines.length; i++) {
      for (const func of deprecatedMysqlFunctions) {
        const regex = new RegExp(`\\b${func}\\s*\\(`);
        const match = lines[i].match(regex);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `${func}() was removed in PHP 7.0. Use mysqli_* functions or WHMCS Capsule ORM instead.`,
            ruleId: 'php-compat-mysql-functions',
            severity: 'error',
            category: 'compatibility',
            fix: `Replace ${func}() with mysqli equivalent or WHMCS Capsule ORM (\\WHMCS\\Database\\Capsule).`,
            fixAction: {
              range: {
                startLine: i + 1,
                startCol: match.index + 1,
                endLine: i + 1,
                endCol: match.index + 1 + func.length,
              },
              replacement: func.replace('mysql_', 'mysqli_'),
              description: `Replace ${func}() with ${func.replace('mysql_', 'mysqli_')}()`,
            },
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect curly brace array/string access deprecated in PHP 7.4, removed in PHP 8.0
 */
export const phpCurlyBraces: Rule = {
  id: 'php-compat-curly-braces',
  description: 'Curly brace array/string access syntax is deprecated in PHP 7.4 and removed in PHP 8.0.',
  severity: 'error',
  category: 'compatibility',
  platform: 'whmcs',
  minPhpVersion: '7.4',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/\$\w+\s*\{(?!\})/);
      if (match && match.index !== undefined) {
        const before = lines[i].substring(0, match.index);
        if (!before.endsWith('{') && !before.endsWith('$')) {
          const openBrace = lines[i].indexOf('{', match.index);
          const closeBrace = lines[i].indexOf('}', openBrace);
          const original = lines[i].substring(match.index, closeBrace + 1);
          const fixed = original.replace('{', '[').replace('}', ']');

          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Curly brace array/string access ($var{0}) is deprecated in PHP 7.4 and removed in PHP 8.0. Use square brackets ($var[0]) instead.',
            ruleId: 'php-compat-curly-braces',
            severity: 'error',
            category: 'compatibility',
            fix: 'Replace $var{key} with $var[key].',
            fixAction: {
              range: {
                startLine: i + 1,
                startCol: match.index + 1,
                endLine: i + 1,
                endCol: closeBrace + 2,
              },
              replacement: fixed,
              description: 'Replace curly brace access with square bracket access',
            },
          });
        }
      }
    }

    return results;
  },
};

/** All PHP compatibility rules */
export const phpCompatibilityRules: Rule[] = [
  phpEachRemoved,
  phpCreateFunction,
  phpMysqlFunctions,
  phpCurlyBraces,
];
