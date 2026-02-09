// Perl Security Rules
// Rules for detecting security vulnerabilities in cPanel plugins

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect potential taint issues in Perl
 */
export const perlTaintCheck: Rule = {
  id: 'perl-security-taint',
  description: 'Potential use of untainted external input.',
  severity: 'error',
  category: 'security',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

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

/**
 * Rule: Detect insecure file permission modes
 */
export const perlFilePermissions: Rule = {
  id: 'perl-file-permissions',
  description: 'Insecure file permission mode detected.',
  severity: 'warning',
  category: 'security',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const chmodMatch = line.match(/\bchmod\s*\(?\s*0?(777|776|766|667|666)\b/);
      if (chmodMatch && chmodMatch.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: chmodMatch.index + 1,
          message: `Insecure file permission mode: ${chmodMatch[1]}. Avoid world-writable or overly permissive modes.`,
          ruleId: 'perl-file-permissions',
          severity: 'warning',
          category: 'security',
          fix: 'Use restrictive permissions (e.g., 0644 for files, 0755 for directories).',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect CGI params used without validation
 */
export const perlInputValidation: Rule = {
  id: 'perl-input-validation',
  description: 'CGI/user input used without validation.',
  severity: 'warning',
  category: 'security',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const inputPatterns = [
        { pattern: /\$(?:cgi|q)->param\s*\(/, msg: 'CGI param()' },
        { pattern: /\$ENV\{['"](?:QUERY_STRING|PATH_INFO|HTTP_)['"]\}/, msg: 'Environment variable' },
      ];

      for (const { pattern, msg } of inputPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          const contextBlock = lines.slice(Math.max(0, i - 1), Math.min(i + 10, lines.length)).join('\n');
          const hasValidation = /\b(?:validate|sanitize|clean|check|verify|argparse)\b/i.test(contextBlock) || (contextBlock.includes('=~') || contextBlock.includes('!~'));
          if (!hasValidation) {
            results.push({
              file: filePath,
              line: i + 1,
              column: match.index + 1,
              message: `${msg} used without apparent validation. Validate and sanitize all user input.`,
              ruleId: 'perl-input-validation',
              severity: 'warning',
              category: 'security',
              fix: 'Validate user input with regex patterns or validation modules before use.',
            });
          }
        }
      }
    }

    return results;
  },
};

/** All Perl security rules */
export const perlSecurityRules: Rule[] = [
  perlTaintCheck,
  perlFilePermissions,
  perlInputValidation,
];
