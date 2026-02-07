// Tests for rule registry
import { describe, it, expect } from 'vitest';
import {
  allRules,
  phpRules,
  perlRules,
  openpanelRules,
  getRulesByPlatform,
  getRuleById,
} from '@hostinglint/core';

describe('Rule Registry', () => {
  it('should have PHP rules', () => {
    expect(phpRules.length).toBeGreaterThan(0);
  });

  it('should have Perl rules', () => {
    expect(perlRules.length).toBeGreaterThan(0);
  });

  it('should have OpenPanel rules', () => {
    expect(openpanelRules.length).toBeGreaterThan(0);
  });

  it('should include all rules in allRules', () => {
    expect(allRules.length).toBe(
      phpRules.length + perlRules.length + openpanelRules.length
    );
  });

  it('should have unique rule IDs', () => {
    const ids = allRules.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  describe('getRulesByPlatform', () => {
    it('should return WHMCS rules for whmcs platform', () => {
      const rules = getRulesByPlatform('whmcs');
      expect(rules.length).toBe(phpRules.length);
      expect(rules.every((r) => r.platform === 'whmcs' || r.platform === 'all')).toBe(true);
    });

    it('should return cPanel rules for cpanel platform', () => {
      const rules = getRulesByPlatform('cpanel');
      expect(rules.length).toBe(perlRules.length);
    });

    it('should return OpenPanel rules for openpanel platform', () => {
      const rules = getRulesByPlatform('openpanel');
      expect(rules.length).toBe(openpanelRules.length);
    });
  });

  describe('getRuleById', () => {
    it('should find a rule by its ID', () => {
      const rule = getRuleById('php-compat-each');
      expect(rule).toBeDefined();
      expect(rule?.id).toBe('php-compat-each');
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
  });
});
