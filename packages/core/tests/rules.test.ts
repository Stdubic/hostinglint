// Tests for rule registry
import { describe, it, expect } from 'vitest';
import {
  allRules,
  phpRules,
  perlRules,
  openpanelRules,
  crossPlatformRules,
  getRulesByPlatform,
  getRuleById,
} from '@hostinglint/core';

describe('Rule Registry', () => {
  it('should have PHP rules', () => {
    expect(phpRules.length).toBeGreaterThan(0);
    expect(phpRules.length).toBe(13);
  });

  it('should have Perl rules', () => {
    expect(perlRules.length).toBeGreaterThan(0);
    expect(perlRules.length).toBe(7);
  });

  it('should have OpenPanel rules', () => {
    expect(openpanelRules.length).toBeGreaterThan(0);
    expect(openpanelRules.length).toBe(5);
  });

  it('should have cross-platform rules', () => {
    expect(crossPlatformRules.length).toBeGreaterThan(0);
    expect(crossPlatformRules.length).toBe(3);
  });

  it('should include all rules in allRules', () => {
    expect(allRules.length).toBe(
      phpRules.length + perlRules.length + openpanelRules.length + crossPlatformRules.length
    );
  });

  it('should have 28 total rules', () => {
    expect(allRules.length).toBe(28);
  });

  it('should have unique rule IDs', () => {
    const ids = allRules.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  describe('getRulesByPlatform', () => {
    it('should return WHMCS rules and cross-platform rules for whmcs platform', () => {
      const rules = getRulesByPlatform('whmcs');
      expect(rules.length).toBe(phpRules.length + crossPlatformRules.length);
      expect(rules.every((r) => r.platform === 'whmcs' || r.platform === 'all')).toBe(true);
    });

    it('should return cPanel rules and cross-platform rules for cpanel platform', () => {
      const rules = getRulesByPlatform('cpanel');
      expect(rules.length).toBe(perlRules.length + crossPlatformRules.length);
    });

    it('should return OpenPanel rules and cross-platform rules for openpanel platform', () => {
      const rules = getRulesByPlatform('openpanel');
      expect(rules.length).toBe(openpanelRules.length + crossPlatformRules.length);
    });
  });

  describe('getRuleById', () => {
    it('should find a rule by its ID', () => {
      const rule = getRuleById('php-compat-each');
      expect(rule).toBeDefined();
      expect(rule?.id).toBe('php-compat-each');
    });

    it('should find new rules by ID', () => {
      expect(getRuleById('php-compat-create-function')).toBeDefined();
      expect(getRuleById('php-compat-mysql-functions')).toBeDefined();
      expect(getRuleById('security-xss')).toBeDefined();
      expect(getRuleById('security-path-traversal')).toBeDefined();
      expect(getRuleById('perl-cpanel-api-version')).toBeDefined();
      expect(getRuleById('perl-file-permissions')).toBeDefined();
      expect(getRuleById('openpanel-security-capabilities')).toBeDefined();
      expect(getRuleById('security-hardcoded-credentials')).toBeDefined();
      expect(getRuleById('security-eval-usage')).toBeDefined();
      expect(getRuleById('best-practice-todo-fixme')).toBeDefined();
    });

    it('should return undefined for unknown rule ID', () => {
      const rule = getRuleById('nonexistent-rule');
      expect(rule).toBeUndefined();
    });
  });

  describe('Rule structure', () => {
    it('all rules should have required fields', () => {
      for (const rule of allRules) {
        expect(rule.id).toBeTruthy();
        expect(rule.description).toBeTruthy();
        expect(['error', 'warning', 'info']).toContain(rule.severity);
        expect(rule.category).toBeTruthy();
        expect(typeof rule.check).toBe('function');
      }
    });

    it('all rules should have valid platform values', () => {
      for (const rule of allRules) {
        expect(['whmcs', 'cpanel', 'openpanel', 'all']).toContain(rule.platform);
      }
    });

    it('cross-platform rules should have platform "all"', () => {
      for (const rule of crossPlatformRules) {
        expect(rule.platform).toBe('all');
      }
    });
  });
});
