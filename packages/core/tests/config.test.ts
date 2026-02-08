// Tests for the configuration file loader
import { describe, it, expect } from 'vitest';
import { mergeConfig, shouldIgnore } from '@hostinglint/core';
import type { HostingLintConfig } from '@hostinglint/core';

describe('Configuration', () => {
  describe('mergeConfig', () => {
    it('should merge overrides with defaults', () => {
      const defaults: HostingLintConfig = {
        rules: { 'rule-a': 'error' },
        phpVersion: '8.3',
        security: true,
        bestPractices: true,
        ignore: ['node_modules/**'],
      };

      const overrides: Partial<HostingLintConfig> = {
        rules: { 'rule-b': 'off' },
        phpVersion: '8.1',
      };

      const result = mergeConfig(defaults, overrides);

      expect(result.rules).toEqual({ 'rule-a': 'error', 'rule-b': 'off' });
      expect(result.phpVersion).toBe('8.1');
      expect(result.security).toBe(true);
      expect(result.ignore).toEqual(['node_modules/**']);
    });

    it('should allow overriding security setting', () => {
      const defaults: HostingLintConfig = { security: true };
      const overrides: Partial<HostingLintConfig> = { security: false };

      const result = mergeConfig(defaults, overrides);
      expect(result.security).toBe(false);
    });
  });

  describe('shouldIgnore', () => {
    it('should match ** glob patterns', () => {
      expect(shouldIgnore('src/node_modules/foo/bar.js', ['node_modules/**'])).toBe(true);
    });

    it('should match * glob patterns', () => {
      expect(shouldIgnore('dist/output.js', ['dist/*'])).toBe(true);
    });

    it('should not match unrelated paths', () => {
      expect(shouldIgnore('src/index.ts', ['node_modules/**'])).toBe(false);
    });

    it('should match vendor directory', () => {
      expect(shouldIgnore('vendor/autoload.php', ['vendor/**'])).toBe(true);
    });

    it('should handle Windows-style paths', () => {
      expect(shouldIgnore('src\\node_modules\\foo\\bar.js', ['node_modules/**'])).toBe(true);
    });
  });
});
