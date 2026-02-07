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
  LintSummary,
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
      const versions: PhpVersion[] = ['7.4', '8.0', '8.1', '8.2', '8.3'];
      expect(versions).toHaveLength(5);
    });
  });

  describe('WhmcsVersion type', () => {
    it('should accept valid WHMCS version values', () => {
      const versions: WhmcsVersion[] = ['8.11', '8.12', '8.13'];
      expect(versions).toHaveLength(3);
    });
  });

  describe('CpanelVersion type', () => {
    it('should accept valid cPanel version values', () => {
      const versions: CpanelVersion[] = ['v132', 'v133', 'v134'];
      expect(versions).toHaveLength(3);
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
    it('should define a valid rule', () => {
      const rule: Rule = {
        id: 'test-rule',
        description: 'A test rule',
        severity: 'error',
        category: 'syntax',
        platform: 'whmcs',
        check: (_code: string, _filePath: string) => [],
      };

      expect(rule.id).toBe('test-rule');
      expect(rule.platform).toBe('whmcs');
      expect(rule.check('', '')).toEqual([]);
    });
  });
});
