// Integration tests: fixAction applied via applyFixes produces correct output
import { describe, it, expect } from 'vitest';
import { analyzePhp, analyzePerl, applyFixes } from '@hostinglint/core';

describe('Auto-fix integration', () => {
  describe('php-compat-curly-braces fix', () => {
    it('should replace curly brace access with square brackets', () => {
      const code = `<?php
$char = $string{0};
`;
      const results = analyzePhp(code, 'test.php');
      const fixable = results.filter((r) => r.fixAction);
      expect(fixable.length).toBeGreaterThanOrEqual(1);

      const fixed = applyFixes(code, results);
      expect(fixed.fixesApplied).toBeGreaterThanOrEqual(1);
      expect(fixed.code).toContain('$string[0]');
      expect(fixed.code).not.toContain('$string{0}');
    });
  });

  describe('security-xss fix', () => {
    it('should wrap user input with htmlspecialchars()', () => {
      const code = `<?php
echo $_GET['name'];
`;
      const results = analyzePhp(code, 'test.php');
      const xssResults = results.filter((r) => r.ruleId === 'security-xss' && r.fixAction);
      expect(xssResults.length).toBeGreaterThanOrEqual(1);

      const fixed = applyFixes(code, results);
      expect(fixed.fixesApplied).toBeGreaterThanOrEqual(1);
      expect(fixed.code).toContain("htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8')");
    });
  });

  describe('perl-deprecated-modules fix', () => {
    it('should comment out deprecated module', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
use CGI;

my $q = CGI->new;
`;
      const results = analyzePerl(code, 'plugin.pl');
      const depResults = results.filter((r) => r.ruleId === 'perl-deprecated-modules' && r.fixAction);
      expect(depResults.length).toBeGreaterThanOrEqual(1);

      const fixed = applyFixes(code, results);
      expect(fixed.fixesApplied).toBeGreaterThanOrEqual(1);
      expect(fixed.code).toContain('# use CGI; # DEPRECATED');
    });
  });

  describe('perl-file-permissions fix', () => {
    it('should replace 0777 with 0755', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
chmod(0777, $file);
`;
      const results = analyzePerl(code, 'plugin.pl');
      const permResults = results.filter((r) => r.ruleId === 'perl-file-permissions' && r.fixAction);
      expect(permResults.length).toBeGreaterThanOrEqual(1);

      const fixed = applyFixes(code, results);
      expect(fixed.fixesApplied).toBeGreaterThanOrEqual(1);
      expect(fixed.code).toContain('0755');
      expect(fixed.code).not.toContain('0777');
    });

    it('should replace 0666 with 0644', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;
chmod(0666, $file);
`;
      const results = analyzePerl(code, 'plugin.pl');
      const fixed = applyFixes(code, results);
      expect(fixed.fixesApplied).toBeGreaterThanOrEqual(1);
      expect(fixed.code).toContain('0644');
    });
  });
});
