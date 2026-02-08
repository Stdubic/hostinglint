// OpenPanel Compatibility Rules
// Rules for OpenPanel extension manifest and API versioning

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Check for missing API version in OpenPanel extension manifest
 */
export const openpanelApiVersioning: Rule = {
  id: 'openpanel-api-versioning',
  description: 'OpenPanel extension should specify API version in manifest.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'openpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    const isManifest = filePath.endsWith('.json') || filePath.includes('manifest');
    if (!isManifest) return results;

    try {
      const parsed = JSON.parse(code);
      if (!parsed.apiVersion && !parsed.api_version && !parsed.version) {
        results.push({
          file: filePath,
          line: 1,
          column: 1,
          message: 'Extension manifest does not specify an API version. Add an apiVersion field for compatibility tracking.',
          ruleId: 'openpanel-api-versioning',
          severity: 'warning',
          category: 'compatibility',
          fix: 'Add "apiVersion": "1.0" to your extension manifest.',
        });
      }
    } catch {
      // Not valid JSON, skip
    }

    return results;
  },
};

/** All OpenPanel compatibility rules */
export const openpanelCompatibilityRules: Rule[] = [
  openpanelApiVersioning,
];
