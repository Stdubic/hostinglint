import { describe, it, expect, beforeEach } from 'vitest';
import { Uri } from './__mocks__/vscode.js';
import { getConfig, invalidateConfigCache, isEnabled, getRunMode } from '../src/config.js';

describe('config', () => {
  beforeEach(() => {
    invalidateConfigCache();
  });

  describe('getConfig', () => {
    it('returns a config object', () => {
      const uri = Uri.file('/workspace/test.php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = getConfig(uri as any);
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('caches config — second call returns same object', () => {
      const uri = Uri.file('/workspace/test.php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config1 = getConfig(uri as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config2 = getConfig(uri as any);
      expect(config1).toBe(config2);
    });

    it('invalidateConfigCache clears cache', () => {
      const uri = Uri.file('/workspace/test.php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config1 = getConfig(uri as any);
      invalidateConfigCache();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config2 = getConfig(uri as any);
      // After invalidation, a new config object is returned (not same reference)
      expect(config1).not.toBe(config2);
    });

    it('invalidateConfigCache with specific URI clears only that entry', () => {
      const uri = Uri.file('/workspace/test.php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config1 = getConfig(uri as any);

      // Invalidate with the workspace folder URI
      invalidateConfigCache(Uri.file('/workspace').toString());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config2 = getConfig(uri as any);
      expect(config1).not.toBe(config2);
    });
  });

  describe('isEnabled', () => {
    it('returns true by default', () => {
      expect(isEnabled()).toBe(true);
    });
  });

  describe('getRunMode', () => {
    it('returns onType by default', () => {
      expect(getRunMode()).toBe('onType');
    });
  });
});
