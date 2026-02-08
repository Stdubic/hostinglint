// Perl Best Practice Rules
// Rules for Perl coding best practices in cPanel plugins

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Check for missing strict/warnings pragmas
 */
export const perlStrictWarnings: Rule = {
  id: 'perl-strict-warnings',
  description: 'Perl scripts should use strict and warnings.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
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
        fixAction: {
          range: { startLine: 1, startCol: 1, endLine: 1, endCol: 1 },
          replacement: 'use strict;\nuse warnings;\n',
          description: 'Insert use strict and use warnings at the top of the file',
        },
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
 * Rule: Detect missing error handling in critical Perl sections
 */
export const perlErrorHandling: Rule = {
  id: 'perl-error-handling',
  description: 'Critical operations should use eval/die for error handling.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const criticalOps = [
        { pattern: /\b(?:DBI->connect|->prepare|->execute)\s*\(/, msg: 'Database operation' },
        { pattern: /\bLWP::UserAgent\b.*->(?:get|post|request)\s*\(/, msg: 'HTTP request' },
      ];

      for (const { pattern, msg } of criticalOps) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          const contextStart = Math.max(0, i - 10);
          const contextBlock = lines.slice(contextStart, i + 1).join('\n');
          if (!contextBlock.includes('eval {') && !contextBlock.includes('eval{') && !contextBlock.includes('Try::Tiny')) {
            results.push({
              file: filePath,
              line: i + 1,
              column: match.index + 1,
              message: `${msg} without error handling. Wrap in eval {} or use Try::Tiny.`,
              ruleId: 'perl-error-handling',
              severity: 'warning',
              category: 'best-practice',
              fix: 'Wrap critical operations in eval { ... }; if ($@) { ... } blocks.',
            });
          }
        }
      }
    }

    return results;
  },
};

/** All Perl best practice rules */
export const perlBestPracticeRules: Rule[] = [
  perlStrictWarnings,
  perlErrorHandling,
];
