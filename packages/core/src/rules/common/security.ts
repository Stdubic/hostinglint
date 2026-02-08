// Cross-Platform Security Rules
// Security rules that apply to all platforms

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect hardcoded credentials in source code
 */
export const securityHardcodedCredentials: Rule = {
  id: 'security-hardcoded-credentials',
  description: 'Potential hardcoded credentials detected in source code.',
  severity: 'error',
  category: 'security',
  platform: 'all',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^\s*(?:\/\/|#|\/\*|\*)/.test(line)) continue;

      const credPatterns = [
        { pattern: /(?:password|passwd|pwd)\s*=\s*['"][^'"]{4,}['"]/i, msg: 'Hardcoded password' },
        { pattern: /(?:api[_-]?key|apikey)\s*=\s*['"][^'"]{8,}['"]/i, msg: 'Hardcoded API key' },
        { pattern: /(?:secret|token)\s*=\s*['"][^'"]{8,}['"]/i, msg: 'Hardcoded secret/token' },
        { pattern: /(?:aws_access_key_id|aws_secret_access_key)\s*=\s*['"][^'"]+['"]/i, msg: 'Hardcoded AWS credential' },
      ];

      for (const { pattern, msg } of credPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          const value = match[0].toLowerCase();
          if (value.includes('example') || value.includes('placeholder') ||
              value.includes('changeme') || value.includes('xxx') ||
              value.includes('your_') || value.includes('test')) {
            continue;
          }
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `${msg} detected. Never commit credentials to source code.`,
            ruleId: 'security-hardcoded-credentials',
            severity: 'error',
            category: 'security',
            fix: 'Use environment variables or a secrets manager for credentials.',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect eval() usage (dangerous in any language)
 */
export const securityEvalUsage: Rule = {
  id: 'security-eval-usage',
  description: 'Usage of eval() detected. eval() can execute arbitrary code.',
  severity: 'warning',
  category: 'security',
  platform: 'all',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^\s*(?:\/\/|#|\/\*|\*)/.test(line)) continue;

      const evalPatterns = [
        /\beval\s*\(/,
        /\beval\s+"/,
        /\beval\s+\$/,
      ];

      for (const pattern of evalPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Usage of eval() detected. eval() can execute arbitrary code and is a security risk.',
            ruleId: 'security-eval-usage',
            severity: 'warning',
            category: 'security',
            fix: 'Avoid eval(). Use safer alternatives like JSON parsing, configuration files, or template engines.',
          });
        }
      }
    }

    return results;
  },
};

/** All cross-platform security rules */
export const commonSecurityRules: Rule[] = [
  securityHardcodedCredentials,
  securityEvalUsage,
];
