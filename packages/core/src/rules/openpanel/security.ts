// OpenPanel Security Rules
// Rules for detecting security issues in OpenPanel extensions

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Check for excessive Docker capabilities
 */
export const openpanelSecurityCapabilities: Rule = {
  id: 'openpanel-security-capabilities',
  description: 'OpenPanel extensions should not request excessive Docker capabilities.',
  severity: 'error',
  category: 'security',
  platform: 'openpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/\bprivileged\s*:\s*true\b/.test(line)) {
        results.push({
          file: filePath,
          line: i + 1,
          column: 1,
          message: 'Container runs in privileged mode. This is a security risk for OpenPanel extensions.',
          ruleId: 'openpanel-security-capabilities',
          severity: 'error',
          category: 'security',
          fix: 'Remove privileged mode and use specific capabilities instead.',
        });
      }

      const capMatch = line.match(/\b(?:SYS_ADMIN|NET_ADMIN|ALL)\b/);
      if (capMatch && capMatch.index !== undefined && /cap_add|capabilities/i.test(lines.slice(Math.max(0, i - 3), i + 1).join('\n'))) {
        results.push({
          file: filePath,
          line: i + 1,
          column: capMatch.index + 1,
          message: `Excessive Docker capability: ${capMatch[0]}. Use minimal capabilities for OpenPanel extensions.`,
          ruleId: 'openpanel-security-capabilities',
          severity: 'error',
          category: 'security',
          fix: 'Use only the minimum required capabilities (e.g., NET_BIND_SERVICE for port binding).',
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Check for missing input validation in OpenCLI commands
 */
export const openpanelCliValidation: Rule = {
  id: 'openpanel-cli-validation',
  description: 'OpenCLI command scripts should validate input arguments.',
  severity: 'warning',
  category: 'security',
  platform: 'openpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    const isScript = filePath.endsWith('.sh') || filePath.endsWith('.py') || filePath.endsWith('.bash');
    if (!isScript) return results;

    const lines = code.split('\n');

    if (filePath.endsWith('.sh') || filePath.endsWith('.bash')) {
      const usesArgs = /\$[1-9]|\$\{[1-9]|\$@|\$\*/.test(code);
      const hasValidation = /\bif\b.*(?:-z|-n|=~|==)/.test(code) || /(?:getopts|getopt)\b/.test(code);

      if (usesArgs && !hasValidation) {
        results.push({
          file: filePath,
          line: 1,
          column: 1,
          message: 'Script uses positional arguments without input validation. Validate all CLI inputs.',
          ruleId: 'openpanel-cli-validation',
          severity: 'warning',
          category: 'security',
          fix: 'Add argument validation (check for empty, validate format) before using positional parameters.',
        });
      }
    }

    if (filePath.endsWith('.py')) {
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/\bsys\.argv\b/);
        if (match && match.index !== undefined) {
          const contextBlock = lines.slice(i, Math.min(i + 5, lines.length)).join('\n');
          if (!contextBlock.includes('argparse') && !contextBlock.includes('try') && !contextBlock.includes('validate')) {
            results.push({
              file: filePath,
              line: i + 1,
              column: match.index + 1,
              message: 'sys.argv used without validation. Use argparse or validate inputs manually.',
              ruleId: 'openpanel-cli-validation',
              severity: 'warning',
              category: 'security',
              fix: 'Use argparse module for argument parsing with type validation.',
            });
          }
        }
      }
    }

    return results;
  },
};

/** All OpenPanel security rules */
export const openpanelSecurityRules: Rule[] = [
  openpanelSecurityCapabilities,
  openpanelCliValidation,
];
