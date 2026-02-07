// Tests for the CLI
import { describe, it, expect } from 'vitest';
import { analyzePhp, analyzePerl } from '@hostinglint/core';

describe('CLI Integration', () => {
  describe('analyzePhp (via core API)', () => {
    it('should analyze PHP code and detect issues', () => {
      const code = `<?php
function mymodule_Config() {
  while (list($k, $v) = each($config)) { echo $k; }
}
`;
      const results = analyzePhp(code, 'test.php');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty results for clean code', () => {
      const code = `<?php
function mymodule_MetaData() {
  return array("DisplayName" => "Test", "APIVersion" => "1.1");
}

function mymodule_Config() {
  return array("name" => "Test Module");
}
`;
      const results = analyzePhp(code, 'test.php', {
        security: false,
        bestPractices: false,
      });
      // Only compatibility rules active, MetaData is present
      const compatResults = results.filter((r) => r.category === 'compatibility');
      expect(compatResults).toHaveLength(0);
    });
  });

  describe('analyzePerl (via core API)', () => {
    it('should analyze Perl code and detect issues', () => {
      const code = `#!/usr/bin/perl
my $var = "hello";
print $var;
`;
      const results = analyzePerl(code, 'test.pl');
      // Should warn about missing strict and warnings
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should pass for clean Perl code', () => {
      const code = `#!/usr/bin/perl
use strict;
use warnings;

my $var = "hello";
print $var;
`;
      const results = analyzePerl(code, 'test.pl', {
        security: false,
        bestPractices: false,
      });
      expect(results).toHaveLength(0);
    });
  });
});
