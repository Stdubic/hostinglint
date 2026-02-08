// PHP Security Rules
// Rules for detecting security vulnerabilities in WHMCS modules

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect potential SQL injection via unsanitized input
 */
export const phpSqlInjection: Rule = {
  id: 'security-sql-injection',
  description: 'Potential SQL injection: user input used directly in SQL query.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

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
 * Rule: Detect potential XSS via unescaped output
 */
export const phpXss: Rule = {
  id: 'security-xss',
  description: 'Potential XSS: user input echoed without escaping.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const xssPatterns = [
        /\becho\s+\$(?:_GET|_POST|_REQUEST|_SERVER)\[/,
        /\bprint\s+\$(?:_GET|_POST|_REQUEST|_SERVER)\[/,
        /\becho\s+\$params\[/,
        /\bprint\s+\$params\[/,
      ];

      for (const pattern of xssPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Potential XSS: user input echoed without escaping. Use htmlspecialchars() or WHMCS template engine.',
            ruleId: 'security-xss',
            severity: 'error',
            category: 'security',
            fix: 'Wrap output with htmlspecialchars($value, ENT_QUOTES, \'UTF-8\') or use WHMCS Smarty templates.',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect potential path traversal via user input in file operations
 */
export const phpPathTraversal: Rule = {
  id: 'security-path-traversal',
  description: 'Potential path traversal: user input used in file operation.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const filePatterns = [
        /\b(?:include|include_once|require|require_once)\s*\(?\s*\$(?:_GET|_POST|_REQUEST|params)/,
        /\b(?:file_get_contents|file_put_contents|fopen|readfile|unlink)\s*\([^)]*\$(?:_GET|_POST|_REQUEST|params)\[/,
      ];

      for (const pattern of filePatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Potential path traversal: user input used in file operation. Validate and sanitize file paths.',
            ruleId: 'security-path-traversal',
            severity: 'error',
            category: 'security',
            fix: 'Validate file paths with realpath() and ensure they stay within expected directories.',
          });
        }
      }
    }

    return results;
  },
};

/** All PHP security rules */
export const phpSecurityRules: Rule[] = [
  phpSqlInjection,
  phpXss,
  phpPathTraversal,
];
