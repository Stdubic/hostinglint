// Tests for inline disable directives
import { describe, it, expect } from 'vitest';
import { parseDisableDirectives, filterDisabledResults } from '@hostinglint/core';
import type { LintResult } from '@hostinglint/core';

describe('Inline Disable', () => {
  describe('parseDisableDirectives', () => {
    it('should parse disable-next-line with specific rule', () => {
      const code = `line 1
// hostinglint-disable-next-line my-rule
line 3
`;
      const directives = parseDisableDirectives(code);
      const disabled = directives.disabledLines.get(3);
      expect(disabled).toBeDefined();
      expect(disabled).not.toBe('all');
      if (disabled !== 'all' && disabled) {
        expect(disabled.has('my-rule')).toBe(true);
      }
    });

    it('should parse disable-next-line without rule (disables all)', () => {
      const code = `line 1
// hostinglint-disable-next-line
line 3
`;
      const directives = parseDisableDirectives(code);
      expect(directives.disabledLines.get(3)).toBe('all');
    });

    it('should parse Perl-style disable comments', () => {
      const code = `line 1
# hostinglint-disable-next-line my-rule
line 3
`;
      const directives = parseDisableDirectives(code);
      const disabled = directives.disabledLines.get(3);
      expect(disabled).toBeDefined();
    });

    it('should parse multiple rules in disable comment', () => {
      const code = `line 1
// hostinglint-disable-next-line rule-a, rule-b
line 3
`;
      const directives = parseDisableDirectives(code);
      const disabled = directives.disabledLines.get(3);
      expect(disabled).not.toBe('all');
      if (disabled !== 'all' && disabled) {
        expect(disabled.has('rule-a')).toBe(true);
        expect(disabled.has('rule-b')).toBe(true);
      }
    });
  });

  describe('filterDisabledResults', () => {
    const makeResult = (line: number, ruleId: string): LintResult => ({
      file: 'test.php',
      line,
      column: 1,
      message: 'test',
      ruleId,
      severity: 'error',
      category: 'security',
    });

    it('should filter out disabled results', () => {
      const code = `line 1
// hostinglint-disable-next-line my-rule
line 3
`;
      const results = [makeResult(3, 'my-rule'), makeResult(1, 'other-rule')];
      const filtered = filterDisabledResults(results, code);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].ruleId).toBe('other-rule');
    });

    it('should keep results when no disable comments exist', () => {
      const code = `line 1
line 2
`;
      const results = [makeResult(1, 'my-rule')];
      const filtered = filterDisabledResults(results, code);
      expect(filtered).toHaveLength(1);
    });

    it('should only filter the specific rule', () => {
      const code = `line 1
// hostinglint-disable-next-line rule-a
line 3
`;
      const results = [makeResult(3, 'rule-a'), makeResult(3, 'rule-b')];
      const filtered = filterDisabledResults(results, code);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].ruleId).toBe('rule-b');
    });

    it('should filter all rules on a line with generic disable', () => {
      const code = `line 1
// hostinglint-disable-next-line
line 3
`;
      const results = [makeResult(3, 'rule-a'), makeResult(3, 'rule-b')];
      const filtered = filterDisabledResults(results, code);
      expect(filtered).toHaveLength(0);
    });
  });
});
