import { describe, it, expect } from 'vitest';
import { analyzeAuto, detectPlatform, applyRuleOverrides } from '@hostinglint/core';
import type { LintResult } from '@hostinglint/core';

describe('detectPlatform', () => {
  it('detects PHP files as whmcs', () => {
    expect(detectPlatform('/path/to/module.php')).toBe('whmcs');
  });

  it('detects Perl files as cpanel', () => {
    expect(detectPlatform('/path/to/plugin.pl')).toBe('cpanel');
    expect(detectPlatform('/path/to/module.pm')).toBe('cpanel');
    expect(detectPlatform('/path/to/handler.cgi')).toBe('cpanel');
  });

  it('detects Dockerfiles as openpanel', () => {
    expect(detectPlatform('/path/to/Dockerfile')).toBe('openpanel');
    expect(detectPlatform('/path/to/Dockerfile.prod')).toBe('openpanel');
  });

  it('returns null for unsupported extensions', () => {
    expect(detectPlatform('/path/to/file.txt')).toBeNull();
    expect(detectPlatform('/path/to/file.js')).toBeNull();
    expect(detectPlatform('/path/to/file.py')).toBeNull();
  });
});

describe('applyRuleOverrides', () => {
  const sampleResults: LintResult[] = [
    {
      file: 'test.php',
      line: 1,
      column: 1,
      message: 'SQL injection detected',
      ruleId: 'security-sql-injection',
      severity: 'error',
      category: 'security',
    },
    {
      file: 'test.php',
      line: 5,
      column: 1,
      message: 'Deprecated function',
      ruleId: 'php-compat-each',
      severity: 'warning',
      category: 'compatibility',
    },
  ];

  it('returns results unchanged when no overrides', () => {
    expect(applyRuleOverrides(sampleResults, {})).toEqual(sampleResults);
  });

  it('filters out rules set to off', () => {
    const result = applyRuleOverrides(sampleResults, { 'security-sql-injection': 'off' });
    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe('php-compat-each');
  });

  it('changes severity for overridden rules', () => {
    const result = applyRuleOverrides(sampleResults, { 'security-sql-injection': 'warning' });
    expect(result).toHaveLength(2);
    expect(result[0].severity).toBe('warning');
  });
});

describe('analyzeAuto', () => {
  it('analyzes PHP files using the whmcs analyzer', () => {
    const phpCode = `<?php
function mymodule_ConfigOptions() {
  $query = "SELECT * FROM tblclients WHERE id=" . $_GET['id'];
}
`;
    const results = analyzeAuto(phpCode, '/path/to/module.php');
    expect(Array.isArray(results)).toBe(true);
    // Should detect at least the SQL injection pattern
    expect(results.length).toBeGreaterThan(0);
  });

  it('analyzes Perl files using the cpanel analyzer', () => {
    const perlCode = `#!/usr/bin/perl
use strict;
use warnings;
my $input = $ENV{'QUERY_STRING'};
system($input);
`;
    const results = analyzeAuto(perlCode, '/path/to/plugin.pl');
    expect(Array.isArray(results)).toBe(true);
  });

  it('analyzes Dockerfiles using the openpanel analyzer', () => {
    const dockerfile = `FROM ubuntu:latest
RUN apt-get update && apt-get install -y curl
USER root
`;
    const results = analyzeAuto(dockerfile, '/path/to/Dockerfile');
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns empty array for unsupported file types', () => {
    const results = analyzeAuto('some content', '/path/to/file.txt');
    expect(results).toEqual([]);
  });

  it('respects platform override option', () => {
    // Treat a .txt file as PHP by overriding platform
    const phpCode = `<?php echo "hello"; ?>`;
    const results = analyzeAuto(phpCode, '/path/to/file.txt', { platform: 'whmcs' });
    expect(Array.isArray(results)).toBe(true);
  });

  it('applies rule overrides to filter results', () => {
    const phpCode = `<?php
$query = "SELECT * FROM tblclients WHERE id=" . $_GET['id'];
`;
    const allResults = analyzeAuto(phpCode, '/path/to/module.php');
    // Now disable all found rules
    const overrides: Record<string, 'off'> = {};
    for (const r of allResults) {
      overrides[r.ruleId] = 'off';
    }
    const filtered = analyzeAuto(phpCode, '/path/to/module.php', { rules: overrides });
    expect(filtered).toEqual([]);
  });
});
