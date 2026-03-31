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
          // Extract the variable being echoed for fixAction
          const varMatch = line.match(/\b(?:echo|print)\s+(\$(?:_GET|_POST|_REQUEST|_SERVER|params)\[[^\]]+\])/);
          const result: LintResult = {
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Potential XSS: user input echoed without escaping. Use htmlspecialchars() or WHMCS template engine.',
            ruleId: 'security-xss',
            severity: 'error',
            category: 'security',
            fix: 'Wrap output with htmlspecialchars($value, ENT_QUOTES, \'UTF-8\') or use WHMCS Smarty templates.',
          };

          if (varMatch && varMatch.index !== undefined) {
            const varStart = varMatch.index + varMatch[0].indexOf(varMatch[1]);
            result.fixAction = {
              range: {
                startLine: i + 1,
                startCol: varStart + 1,
                endLine: i + 1,
                endCol: varStart + varMatch[1].length + 1,
              },
              replacement: `htmlspecialchars(${varMatch[1]}, ENT_QUOTES, 'UTF-8')`,
              description: `Wrap ${varMatch[1]} with htmlspecialchars()`,
            };
          }

          results.push(result);
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

/**
 * Rule: Detect insecure deserialization via unserialize() with user input
 */
export const phpDeserialization: Rule = {
  id: 'security-php-deserialization',
  description: 'Insecure deserialization: unserialize() used with user-controlled data.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(?:\/\/|#|\*|\/\*)/.test(line)) continue;

      const match = line.match(/\bunserialize\s*\(\s*\$(?:_GET|_POST|_REQUEST|_COOKIE|params)\b/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'Insecure deserialization: unserialize() with user-controlled data can lead to remote code execution (CWE-502).',
          ruleId: 'security-php-deserialization',
          severity: 'error',
          category: 'security',
          fix: 'Use json_decode() instead, or validate/whitelist allowed classes with the second parameter: unserialize($data, ["allowed_classes" => false]).',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect server-side request forgery via user-controlled URLs
 */
export const phpSsrf: Rule = {
  id: 'security-php-ssrf',
  description: 'Potential SSRF: user input controls URL in HTTP request.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(?:\/\/|#|\*|\/\*)/.test(line)) continue;

      const match = line.match(/\b(?:file_get_contents|curl_init|curl_setopt.*CURLOPT_URL|fopen|readfile)\s*\([^)]*\$(?:_GET|_POST|_REQUEST)\[/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'Potential SSRF: user input controls URL in HTTP request. Attacker can reach internal services (CWE-918).',
          ruleId: 'security-php-ssrf',
          severity: 'error',
          category: 'security',
          fix: 'Validate URLs against an allowlist of trusted domains. Never pass raw user input to HTTP functions.',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect weak cryptographic algorithms for password hashing
 */
export const phpWeakCrypto: Rule = {
  id: 'security-php-weak-crypto',
  description: 'Weak password hashing: MD5/SHA1 are not suitable for passwords.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(?:\/\/|#|\*|\/\*)/.test(line)) continue;

      const match = line.match(/\b(?:md5|sha1)\s*\(\s*\$(?:password|passwd|pwd|pass|secret|token)\b/i);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'Weak password hashing: MD5/SHA1 are cryptographically broken for password storage (CWE-327).',
          ruleId: 'security-php-weak-crypto',
          severity: 'error',
          category: 'security',
          fix: 'Use password_hash($password, PASSWORD_ARGON2ID) or PASSWORD_BCRYPT with password_verify() for checking.',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect potential command injection via user input in OS commands
 */
export const phpCommandInjection: Rule = {
  id: 'security-command-injection',
  description: 'Potential command injection: user input in OS command execution.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    const cmdPatterns = [
      /\b(?:exec|shell_exec|system|passthru|proc_open|popen)\s*\([^)]*\$(?:_GET|_POST|_REQUEST|_COOKIE|params)\[/,
      /`[^`]*\$(?:_GET|_POST|_REQUEST|_COOKIE|params)\[/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments
      if (/^\s*(?:\/\/|#|\*|\/\*)/.test(line)) continue;

      // Skip lines with proper sanitization
      if (/escapeshellarg|escapeshellcmd/.test(line)) continue;

      for (const pattern of cmdPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Potential command injection: user input in OS command execution. Unsanitized input in shell commands can lead to arbitrary command execution (CWE-78).',
            ruleId: 'security-command-injection',
            severity: 'error',
            category: 'security',
            fix: 'Use escapeshellarg() for arguments or escapeshellcmd() for commands. Prefer PHP built-in functions over shell commands when possible.',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect use of cryptographically weak PRNG for security-sensitive values
 */
export const phpInsecureRandom: Rule = {
  id: 'security-insecure-random',
  description: 'Insecure randomness: cryptographically weak PRNG used for security-sensitive value.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    const insecureRandomPatterns = [
      // Pattern 1: Security-named variable assigned insecure random
      /\$(?:token|key|secret|nonce|salt|session_id|csrf|api_key|password|hash|seed)\s*=\s*.*\b(?:rand|mt_rand|uniqid|microtime|time)\s*\(/i,
      // Pattern 2: Hash wrapping insecure random (weak token generation)
      /\b(?:md5|sha1|hash)\s*\([^)]*\b(?:rand|mt_rand|uniqid|microtime|time)\s*\(/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments
      if (/^\s*(?:\/\/|#|\*|\/\*)/.test(line)) continue;

      // Skip lines with safe alternatives
      if (/random_bytes|random_int|openssl_random_pseudo_bytes/.test(line)) continue;

      for (const pattern of insecureRandomPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Insecure randomness: cryptographically weak PRNG (rand, mt_rand, uniqid, time) used for security-sensitive value. These are predictable and unsuitable for tokens, keys, or secrets (CWE-338).',
            ruleId: 'security-insecure-random',
            severity: 'error',
            category: 'security',
            fix: 'Use random_bytes(32) for raw bytes, bin2hex(random_bytes(16)) for hex tokens, or random_int() for numeric ranges. For WHMCS, use \\WHMCS\\Security::generateToken().',
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
  phpDeserialization,
  phpSsrf,
  phpWeakCrypto,
  phpCommandInjection,
  phpInsecureRandom,
];
