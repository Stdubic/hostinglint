# HostingLint Architecture

**Version:** 0.1.0
**Date:** February 2026
**For:** NLnet NGI Zero Commons Fund Application

---

## System Overview

HostingLint is a static analysis engine that validates hosting control panel modules across three platforms using a unified TypeScript architecture.

```
                         ┌─────────────────┐
                         │   CLI (hostinglint)   │
                         │  Commander.js + SARIF  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │  @hostinglint/core     │
                         │  Public API + Config   │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼────────┐ ┌────────▼────────┐
     │  PHP Analyzer    │ │ Perl Analyzer   │ │ OpenPanel        │
     │  WHMCS modules   │ │ cPanel plugins  │ │ Docker extensions│
     └────────┬────────┘ └───────┬────────┘ └────────┬────────┘
              │                   │                   │
     ┌────────▼────────┐ ┌───────▼────────┐ ┌────────▼────────┐
     │  PHP Rules (13)  │ │ Perl Rules (7)  │ │ OpenPanel (5)   │
     │  + Common (3)    │ │ + Common (3)    │ │ + Common (3)    │
     └─────────────────┘ └────────────────┘ └─────────────────┘
```

## Package Structure

### npm Workspace Monorepo

```
hostinglint/
├── packages/
│   ├── core/                 @hostinglint/core (library)
│   │   ├── src/
│   │   │   ├── analyzers/    Platform-specific analysis engines
│   │   │   │   ├── base.ts   Base analyzer factory + version utils
│   │   │   │   ├── php/      PHP/WHMCS analyzer
│   │   │   │   ├── perl/     Perl/cPanel analyzer
│   │   │   │   └── openpanel/ OpenPanel/Docker analyzer
│   │   │   ├── rules/        Rule definitions
│   │   │   │   ├── php/      PHP compatibility, security, WHMCS
│   │   │   │   ├── perl/     Perl security, compatibility, best practice
│   │   │   │   ├── openpanel/ Docker security, compatibility
│   │   │   │   ├── common/   Cross-platform rules (credentials, eval, TODO)
│   │   │   │   ├── registry.ts  RuleRegistry class
│   │   │   │   └── index.ts  Rule exports and lookup functions
│   │   │   ├── config.ts     Configuration loading/validation
│   │   │   ├── fixer.ts      Auto-fix engine
│   │   │   ├── inline-disable.ts  Inline comment directives
│   │   │   ├── plugins.ts    Plugin loading/validation
│   │   │   ├── presets.ts     Shared configurations
│   │   │   ├── types.ts      Core type definitions
│   │   │   └── index.ts      Public API
│   │   └── tests/            Vitest test suite (131 tests)
│   └── cli/                  hostinglint CLI (Commander.js)
│       ├── src/cli.ts        Entry point
│       └── tests/            CLI integration tests
├── examples/                 Sample modules for testing
│   ├── whmcs-sample/         Clean WHMCS modules
│   ├── cpanel-sample/        Clean cPanel plugins
│   └── vulnerable/           Intentionally vulnerable examples
│       ├── whmcs-vulnerable/
│       ├── cpanel-vulnerable/
│       └── openpanel-vulnerable/
└── docs/                     Documentation
```

## Analysis Pipeline

### Data Flow

```
Input File  →  Detect Platform  →  Select Rules  →  Run Checks  →  Collect Results  →  Format Output
   .php          PHP/WHMCS         13 PHP rules      regex match     LintResult[]       text/json/sarif
   .pl           Perl/cPanel        7 Perl rules     per-line scan   sorted by line
   Dockerfile    OpenPanel          5 OpenPanel       + context
   .yml/.yaml    OpenPanel         + 3 cross-plat
   .json         OpenPanel
   .sh/.py       OpenPanel
```

### Analyzer Factory Pattern

All three analyzers share a common factory (`createAnalyzer`) that:

1. Merges user options with defaults
2. Filters rules based on platform, severity, and version constraints
3. Constructs a `RuleContext` with pre-split lines and config
4. Runs each applicable rule against the code
5. Sorts results by line number and column
6. Returns `LintResult[]`

Version filtering is platform-specific:
- PHP rules filter by `minPhpVersion` (e.g., `php-compat-each` only fires for PHP >= 8.0)
- Perl rules filter by `minCpanelVersion`
- OpenPanel rules have no version constraints (always active)

## Rule Architecture

### Rule Interface

```typescript
interface Rule {
  id: string;                           // e.g., 'security-sql-injection'
  description: string;                  // Human-readable
  severity: 'error' | 'warning' | 'info';
  category: string;                     // 'security', 'compatibility', 'best-practice'
  platform: 'whmcs' | 'cpanel' | 'openpanel' | 'all';
  check: (context: RuleContext) => LintResult[];
  minPhpVersion?: PhpVersion;           // Version constraint
  minWhmcsVersion?: WhmcsVersion;
  minCpanelVersion?: CpanelVersion;
}
```

### Detection Approach

All rules use regex-based pattern matching on code strings:

- **Simple patterns** (90%): Single-line regex matching (e.g., `\beach\s*\(`)
- **Context-aware** (8%): Multi-line window analysis (check surrounding lines)
- **Structural** (2%): File-level analysis (check for presence/absence of constructs)

No PHP or Perl runtime is required. No code is ever executed.

### False Positive Mitigation

1. Comment detection: skip lines starting with `//`, `#`, `/*`, `*`
2. String exclusion: patterns in quoted strings are filtered
3. File-type validation: rules only run on relevant file types
4. Context validation: additional evidence required (e.g., WHMCS module structure)

## Output Formats

| Format | Use Case | Standard |
|--------|----------|----------|
| text   | Human-readable CLI output | ESLint-style |
| json   | Machine processing, piping | JSON array |
| sarif  | GitHub Code Scanning, CI/CD | SARIF 2.1.0 |

## Configuration System

### .hostinglintrc.json

```json
{
  "rules": { "whmcs-license-check": "off" },
  "phpVersion": "8.1",
  "ignore": ["vendor/**"],
  "preset": "recommended"
}
```

### Inline Disabling

```php
// hostinglint-disable-next-line security-sql-injection
// hostinglint-disable rule-id
// hostinglint-enable rule-id
```

### Presets

- **recommended**: balanced error/warning configuration
- **strict**: all rules at error level
- **security-only**: only security rules enabled

## Performance

- Analysis is sub-millisecond per file (0.13 ms average, benchmarked)
- Target: < 100 ms per 1000 lines with 50+ rules
- Regex patterns are compiled once, reused across lines
- Early returns skip irrelevant files (e.g., `.php` rules skip `.pl` files)

## Security Model

- **Read-only**: HostingLint never modifies analyzed files
- **No execution**: Code is analyzed as strings, never evaluated
- **No runtime**: No PHP or Perl interpreter required
- **Pure functions**: Rules have no side effects, no network calls
- **Sandboxed plugins**: Plugin rules validated against strict interface

---

*Prepared for NLnet NGI Zero Commons Fund Application, February 2026*
