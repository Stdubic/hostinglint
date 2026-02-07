// Tests for the Perl analyzer (cPanel plugins)
import { describe, it, expect } from 'vitest';
import { analyzePerl } from '@hostinglint/core';

describe('Perl Analyzer', () => {
  describe('strict/warnings detection', () => {
    it('should warn when strict is missing', () => {
      const code = `#!/usr/bin/perl
use warnings;

my $var = "hello";
print $var;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const strictResults = results.filter(
        (r) => r.ruleId === 'perl-strict-warnings' && r.message.includes('strict')
      );

      expect(strictResults).toHaveLength(1);
    });

    it('should warn when warnings is missing', () => {
      const code = `#!/usr/bin/perl
use strict;

my $var = "hello";
print $var;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const warningResults = results.filter(
        (r) => r.ruleId === 'perl-strict-warnings' && r.message.includes('warnings')
      );

      expect(warningResults).toHaveLength(1);
    });

    it('should not warn when both strict and warnings are present', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my $var = "hello";
print $var;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const pragmaResults = results.filter((r) => r.ruleId === 'perl-strict-warnings');

      expect(pragmaResults).toHaveLength(0);
    });
  });

  describe('Taint/security detection', () => {
    it('should detect system() calls with variables', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my $input = $ARGV[0];
system("ls -la $input");
`;
      const results = analyzePerl(code, 'plugin.pl');
      const secResults = results.filter((r) => r.ruleId === 'perl-security-taint');

      expect(secResults.length).toBeGreaterThanOrEqual(1);
      expect(secResults[0].severity).toBe('error');
    });

    it('should detect backtick execution with variables', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my $cmd = $ARGV[0];
my $output = \`whoami $cmd\`;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const secResults = results.filter((r) => r.ruleId === 'perl-security-taint');

      expect(secResults.length).toBeGreaterThanOrEqual(1);
    });

    it('should not flag safe operations', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my @files = glob("*.txt");
print join("\\n", @files);
`;
      const results = analyzePerl(code, 'plugin.pl');
      const secResults = results.filter((r) => r.ruleId === 'perl-security-taint');

      expect(secResults).toHaveLength(0);
    });
  });

  describe('Options', () => {
    it('should respect security option when disabled', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
system("ls -la $input");
`;
      const results = analyzePerl(code, 'plugin.pl', { security: false });
      const secResults = results.filter((r) => r.category === 'security');

      expect(secResults).toHaveLength(0);
    });
  });
});
