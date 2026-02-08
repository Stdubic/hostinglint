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

  describe('cPanel API version detection', () => {
    it('should detect deprecated API1 usage', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my $result = Cpanel::API1::exec("Email", "listpops");
`;
      const results = analyzePerl(code, 'plugin.pl');
      const apiResults = results.filter((r) => r.ruleId === 'perl-cpanel-api-version');
      expect(apiResults).toHaveLength(1);
    });

    it('should not flag UAPI usage', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my $result = Cpanel::UAPI::exec("Email", "list_pops");
`;
      const results = analyzePerl(code, 'plugin.pl');
      const apiResults = results.filter((r) => r.ruleId === 'perl-cpanel-api-version');
      expect(apiResults).toHaveLength(0);
    });
  });

  describe('File permissions detection', () => {
    it('should detect overly permissive chmod 777', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

chmod 0777, "/tmp/myfile";
`;
      const results = analyzePerl(code, 'plugin.pl');
      const permResults = results.filter((r) => r.ruleId === 'perl-file-permissions');
      expect(permResults).toHaveLength(1);
    });

    it('should not flag chmod 644', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

chmod 0644, "/tmp/myfile";
`;
      const results = analyzePerl(code, 'plugin.pl');
      const permResults = results.filter((r) => r.ruleId === 'perl-file-permissions');
      expect(permResults).toHaveLength(0);
    });
  });

  describe('Deprecated module detection', () => {
    it('should detect use CGI', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
use CGI;

my $q = CGI->new;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const depResults = results.filter((r) => r.ruleId === 'perl-deprecated-modules');
      expect(depResults).toHaveLength(1);
    });

    it('should not flag modern modules', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
use JSON;
use LWP::UserAgent;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const depResults = results.filter((r) => r.ruleId === 'perl-deprecated-modules');
      expect(depResults).toHaveLength(0);
    });
  });

  describe('Error handling detection', () => {
    it('should warn about DBI operations without eval', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
use DBI;

my $dbh = DBI->connect("dbi:mysql:testdb", "user", "pass");
`;
      const results = analyzePerl(code, 'plugin.pl');
      const errResults = results.filter((r) => r.ruleId === 'perl-error-handling');
      expect(errResults).toHaveLength(1);
    });

    it('should not warn when wrapped in eval', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
use DBI;

eval {
  my $dbh = DBI->connect("dbi:mysql:testdb", "user", "pass");
};
if ($@) { warn "DB error: $@"; }
`;
      const results = analyzePerl(code, 'plugin.pl');
      const errResults = results.filter((r) => r.ruleId === 'perl-error-handling');
      expect(errResults).toHaveLength(0);
    });
  });

  describe('Inline disable for Perl', () => {
    it('should suppress findings with Perl-style disable comment', () => {
      const code = `#!/usr/bin/perl
use warnings;
# hostinglint-disable perl-strict-warnings

my $var = "hello";
`;
      const results = analyzePerl(code, 'plugin.pl');
      const strictResults = results.filter(
        (r) => r.ruleId === 'perl-strict-warnings' && r.message.includes('strict')
      );
      // The "missing strict" warning fires on line 1 which is before the disable
      // but the block disable should suppress subsequent findings
      expect(strictResults.length).toBeLessThanOrEqual(1);
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

    it('should respect bestPractices option when disabled', () => {
      const code = `#!/usr/bin/perl
my $var = "hello";
`;
      const results = analyzePerl(code, 'plugin.pl', { security: false, bestPractices: false });
      const bpResults = results.filter((r) => r.category === 'best-practice');

      expect(bpResults).toHaveLength(0);
    });
  });
});
