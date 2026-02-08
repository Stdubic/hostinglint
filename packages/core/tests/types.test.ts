// Tests for core type definitions and type safety
import { describe, it, expect } from 'vitest';
import type {
  Platform,
  Severity,
  OutputFormat,
  PhpVersion,
  WhmcsVersion,
  CpanelVersion,
  LintResult,
  Rule,
  RuleContext,
  LintSummary,
  FixAction,
} from '@hostinglint/core';

describe('Core Types', () => {
  describe('LintResult', () => {
    it('should accept a valid lint result', () => {
      const result: LintResult = {
        file: 'test.php',
        line: 10,
        column: 5,
        message: 'Test error message',
        ruleId: 'test-rule',
        severity: 'error',
        category: 'syntax',
      };

      expect(result.file).toBe('test.php');
      expect(result.line).toBe(10);
      expect(result.column).toBe(5);
      expect(result.severity).toBe('error');
    });

    it('should accept a lint result with optional fix', () => {
      const result: LintResult = {
        file: 'test.php',
        line: 1,
        column: 1,
        message: 'Issue found',
        ruleId: 'test-rule',
        severity: 'warning',
        category: 'compatibility',
        fix: 'Replace X with Y',
      };

      expect(result.fix).toBe('Replace X with Y');
    });
  });

  describe('Platform type', () => {
    it('should accept valid platform values', () => {
      const platforms: Platform[] = ['whmcs', 'cpanel', 'openpanel'];
      expect(platforms).toHaveLength(3);
    });
  });

  describe('Severity type', () => {
    it('should accept valid severity values', () => {
      const severities: Severity[] = ['error', 'warning', 'info'];
      expect(severities).toHaveLength(3);
    });
  });

  describe('OutputFormat type', () => {
    it('should accept valid output format values', () => {
      const formats: OutputFormat[] = ['text', 'json', 'sarif'];
      expect(formats).toHaveLength(3);
    });
  });

  describe('PhpVersion type', () => {
    it('should accept valid PHP version values', () => {
      const versions: PhpVersion[] = ['7.4', '8.0', '8.1', '8.2', '8.3', '8.4'];
      expect(versions).toHaveLength(6);
    });
  });

  describe('WhmcsVersion type', () => {
    it('should accept valid WHMCS version values', () => {
      const versions: WhmcsVersion[] = ['8.11', '8.12', '8.13', '8.14'];
      expect(versions).toHaveLength(4);
    });
  });

  describe('CpanelVersion type', () => {
    it('should accept valid cPanel version values', () => {
      const versions: CpanelVersion[] = ['v132', 'v133', 'v134', 'v135'];
      expect(versions).toHaveLength(4);
    });
  });

  describe('LintSummary', () => {
    it('should create a valid summary', () => {
      const summary: LintSummary = {
        filesChecked: 5,
        errors: 2,
        warnings: 3,
        infos: 1,
        results: new Map(),
      };

      expect(summary.filesChecked).toBe(5);
      expect(summary.errors).toBe(2);
      expect(summary.warnings).toBe(3);
      expect(summary.infos).toBe(1);
      expect(summary.results.size).toBe(0);
    });
  });

  describe('Rule', () => {
    it('should define a valid rule with RuleContext', () => {
      const rule: Rule = {
        id: 'test-rule',
        description: 'A test rule',
        severity: 'error',
        category: 'syntax',
        platform: 'whmcs',
        check: (_context: RuleContext) => [],
      };

      const context: RuleContext = {
        code: '',
        filePath: '',
        lines: [],
        config: {},
      };

      expect(rule.id).toBe('test-rule');
      expect(rule.platform).toBe('whmcs');
      expect(rule.check(context)).toEqual([]);
    });
  });

  describe('FixAction', () => {
    it('should define a valid fix action', () => {
      const fix: FixAction = {
        range: { startLine: 1, startCol: 1, endLine: 1, endCol: 10 },
        replacement: 'foreach(',
        description: 'Replace each() with foreach()',
      };

      expect(fix.range.startLine).toBe(1);
      expect(fix.replacement).toBe('foreach(');
    });

    it('should attach to a lint result', () => {
      const result: LintResult = {
        file: 'test.php',
        line: 5,
        column: 3,
        message: 'each() removed',
        ruleId: 'php-compat-each',
        severity: 'error',
        category: 'compatibility',
        fix: 'Replace each() with foreach()',
        fixAction: {
          range: { startLine: 5, startCol: 3, endLine: 5, endCol: 8 },
          replacement: 'foreach(',
          description: 'Replace each() with foreach()',
        },
      };

      expect(result.fixAction).toBeDefined();
      expect(result.fixAction?.replacement).toBe('foreach(');
    });
  });
});
