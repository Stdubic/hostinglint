// Cross-Platform Best Practice Rules
// Best practice rules that apply to all platforms

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect TODO/FIXME comments indicating incomplete code
 */
export const bestPracticeTodoFixme: Rule = {
  id: 'best-practice-todo-fixme',
  description: 'TODO/FIXME comment found indicating incomplete code.',
  severity: 'info',
  category: 'best-practice',
  platform: 'all',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/\b(TODO|FIXME|HACK|XXX|BUG)\b/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: `${match[1]} comment found. Address before production deployment.`,
          ruleId: 'best-practice-todo-fixme',
          severity: 'info',
          category: 'best-practice',
        });
      }
    }

    return results;
  },
};

/** All cross-platform best practice rules */
export const commonBestPracticeRules: Rule[] = [
  bestPracticeTodoFixme,
];
