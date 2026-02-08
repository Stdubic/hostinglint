// OpenPanel Docker Rules
// Rules for Dockerfile and Docker Compose best practices

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Check Dockerfile best practices for OpenPanel extensions
 */
export const openpanelDockerfile: Rule = {
  id: 'openpanel-dockerfile',
  description: 'OpenPanel Dockerfile should follow best practices.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'openpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    if (!filePath.toLowerCase().includes('dockerfile')) return results;

    const lines = code.split('\n');

    const hasUser = lines.some((line) => /^USER\s+/i.test(line.trim()));
    if (!hasUser) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Dockerfile does not set a non-root USER. OpenPanel extensions should not run as root.',
        ruleId: 'openpanel-dockerfile',
        severity: 'warning',
        category: 'best-practice',
        fix: 'Add a USER directive to run as a non-root user.',
      });
    }

    const hasHealthcheck = lines.some((line) => /^HEALTHCHECK\s+/i.test(line.trim()));
    if (!hasHealthcheck) {
      results.push({
        file: filePath,
        line: 1,
        column: 1,
        message: 'Dockerfile does not define a HEALTHCHECK. OpenPanel uses health checks for extension monitoring.',
        ruleId: 'openpanel-dockerfile',
        severity: 'info',
        category: 'best-practice',
      });
    }

    return results;
  },
};

/**
 * Rule: Check for missing resource limits in Docker containers
 */
export const openpanelResourceLimits: Rule = {
  id: 'openpanel-resource-limits',
  description: 'OpenPanel Docker extensions should define resource limits.',
  severity: 'warning',
  category: 'best-practice',
  platform: 'openpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];

    if (!filePath.toLowerCase().includes('dockerfile') && !filePath.endsWith('.yml') && !filePath.endsWith('.yaml')) {
      return results;
    }

    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      if (code.includes('services:') && !code.includes('mem_limit') && !code.includes('memory:') && !code.includes('cpus:')) {
        results.push({
          file: filePath,
          line: 1,
          column: 1,
          message: 'Docker Compose service does not define resource limits (memory/CPU). OpenPanel extensions should set resource constraints.',
          ruleId: 'openpanel-resource-limits',
          severity: 'warning',
          category: 'best-practice',
          fix: 'Add deploy.resources.limits with memory and cpus constraints.',
        });
      }
    }

    return results;
  },
};

/** All OpenPanel Docker rules */
export const openpanelDockerRules: Rule[] = [
  openpanelDockerfile,
  openpanelResourceLimits,
];
