// Perl Compatibility Rules
// Rules for detecting compatibility issues with cPanel versions and Perl modules

import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect deprecated cPanel API1 usage
 */
export const perlCpanelApiVersion: Rule = {
  id: 'perl-cpanel-api-version',
  description: 'Deprecated cPanel API1 usage detected. Use API2 or UAPI instead.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const apiPatterns = [
        { pattern: /\bCpanel::API1\b/, msg: 'Cpanel::API1' },
        { pattern: /\bcpanel_api1_request\b/, msg: 'cpanel_api1_request()' },
        { pattern: /\bapi1\s*\(/, msg: 'api1()' },
      ];

      for (const { pattern, msg } of apiPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `Deprecated cPanel API1 usage (${msg}). Migrate to UAPI or API2.`,
            ruleId: 'perl-cpanel-api-version',
            severity: 'warning',
            category: 'compatibility',
            fix: 'Replace API1 calls with UAPI equivalents. See cPanel documentation for migration guide.',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect use of deprecated Perl modules
 */
export const perlDeprecatedModules: Rule = {
  id: 'perl-deprecated-modules',
  description: 'Usage of deprecated Perl module detected.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    const deprecatedModules: Record<string, string> = {
      'CGI': 'CGI.pm is discouraged for new code. Use Plack/PSGI or cPanel UAPI instead.',
      'Switch': 'Switch module is deprecated. Use given/when or if/elsif chains.',
      'Class::ISA': 'Class::ISA was removed from core. Use mro::get_linear_isa() instead.',
      'Pod::Plainer': 'Pod::Plainer was removed from core.',
      'Shell': 'Shell module is deprecated. Use IPC::Run or system() with list form.',
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const [mod, suggestion] of Object.entries(deprecatedModules)) {
        const regex = new RegExp(`^\\s*use\\s+${mod.replace('::', '::')}\\b`);
        const match = line.match(regex);
        if (match && match.index !== undefined) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `Deprecated module: ${mod}. ${suggestion}`,
            ruleId: 'perl-deprecated-modules',
            severity: 'warning',
            category: 'compatibility',
            fix: suggestion,
            fixAction: {
              range: {
                startLine: i + 1,
                startCol: 1,
                endLine: i + 1,
                endCol: line.length + 1,
              },
              replacement: `# ${line.trim()} # DEPRECATED`,
              description: `Comment out deprecated module: ${mod}`,
            },
          });
        }
      }
    }

    return results;
  },
};

/** All Perl compatibility rules */
export const perlCompatibilityRules: Rule[] = [
  perlCpanelApiVersion,
  perlDeprecatedModules,
];
