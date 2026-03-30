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
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect two-argument open() which is insecure
 */
export const perlCompatTwoArgOpen: Rule = {
  id: 'perl-compat-two-arg-open',
  description: 'Two-argument open() is insecure. Use three-argument form.',
  severity: 'warning',
  category: 'compatibility',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*#/.test(line)) continue;

      const match = line.match(/\bopen\s*\(([^)]+)\)/);
      if (match && match.index !== undefined) {
        const args = match[1];
        const commas = args.split(',').length - 1;
        if (commas === 1) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: 'Two-argument open() is insecure and allows shell injection via metacharacters. Use the three-argument form.',
            ruleId: 'perl-compat-two-arg-open',
            severity: 'warning',
            category: 'compatibility',
            fix: 'Use three-argument open(): open(my $fh, "<", $filename) or die "Cannot open: $!"',
          });
        }
      }
    }

    return results;
  },
};

/**
 * Rule: Detect indirect object syntax (new ClassName)
 */
export const perlCompatIndirectObject: Rule = {
  id: 'perl-compat-indirect-object',
  description: 'Indirect object syntax "new ClassName()" is deprecated. Use ClassName->new().',
  severity: 'warning',
  category: 'compatibility',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*#/.test(line)) continue;

      const match = line.match(/(?<!\->)\bnew\s+([A-Z]\w*(?:::\w+)*)\s*[\(;,)]/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: `Indirect object syntax "new ${match[1]}()" is deprecated since Perl 5.36. Use ${match[1]}->new() instead.`,
          ruleId: 'perl-compat-indirect-object',
          severity: 'warning',
          category: 'compatibility',
          fix: `Replace "new ${match[1]}(...)" with "${match[1]}->new(...)"`,
        });
      }
    }

    return results;
  },
};

/**
 * Rule: Detect bareword filehandles (deprecated since Perl 5.36)
 */
export const perlCompatBarewordFilehandle: Rule = {
  id: 'perl-compat-bareword-filehandle',
  description: 'Bareword filehandle is deprecated. Use lexical filehandle (my $fh).',
  severity: 'warning',
  category: 'compatibility',
  platform: 'cpanel',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    const standardFHs = new Set(['STDIN', 'STDOUT', 'STDERR', 'ARGV', 'DATA', 'ARGVOUT']);

    const barewordPatterns = [
      /\bopen\s*\(\s*([A-Z][A-Z0-9_]*)\s*,/,
      /\b(?:print|say)\s+([A-Z][A-Z0-9_]*)\s+/,
      /\b(?:close|eof|binmode|fileno|read|seek|tell)\s*\(\s*([A-Z][A-Z0-9_]*)\s*[,)]/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*#/.test(line)) continue;

      for (const pattern of barewordPatterns) {
        const match = line.match(pattern);
        if (match && match.index !== undefined && match[1] && !standardFHs.has(match[1])) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index + 1,
            message: `Bareword filehandle "${match[1]}" is deprecated since Perl 5.36. Use a lexical filehandle instead.`,
            ruleId: 'perl-compat-bareword-filehandle',
            severity: 'warning',
            category: 'compatibility',
            fix: 'Use lexical filehandle: open(my $fh, "<", $filename)',
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
  perlCompatTwoArgOpen,
  perlCompatIndirectObject,
  perlCompatBarewordFilehandle,
];
