# HostingLint Architecture

Technical architecture overview for contributors and maintainers.

## Overview

HostingLint is a static analysis toolkit built as an npm workspace monorepo. It performs regex-based pattern matching on source code strings -- no PHP or Perl runtime required.

```
hostinglint/
├── packages/
│   ├── core/          # @hostinglint/core — analysis engine
│   └── cli/           # hostinglint — CLI binary
├── examples/          # Sample modules for testing
├── docs/              # Documentation
└── [config files]
```

## Package Architecture

### @hostinglint/core

The core package contains all analysis logic and is designed to be used as a library.

```
packages/core/src/
├── analyzers/
│   ├── php/index.ts       # PHP/WHMCS analyzer
│   ├── perl/index.ts      # Perl/cPanel analyzer
│   └── openpanel/index.ts # OpenPanel analyzer
├── rules/index.ts         # Rule definitions and registry
├── config.ts              # Configuration file loader
├── inline-disable.ts      # Inline comment disable support
├── types.ts               # Core type definitions
└── index.ts               # Public API exports
```

### hostinglint (CLI)

The CLI package is a thin wrapper around `@hostinglint/core` using Commander.js.

```
packages/cli/src/
└── cli.ts                 # CLI entry point
```

## Data Flow

```
Input Files
    │
    ▼
File Collection (CLI walks directories, filters by extension)
    │
    ▼
Platform Detection (auto-detect from file extension, or --platform flag)
    │
    ▼
Config Loading (.hostinglintrc.json search up directory tree)
    │
    ▼
Rule Filtering (by platform, version, category, security/bestPractices flags)
    │
    ▼
Rule Execution (each rule runs regex checks on code string)
    │
    ▼
Inline Disable Filtering (remove results suppressed by comments)
    │
    ▼
Rule Override Application (config-based severity changes or disables)
    │
    ▼
Output Formatting (text, JSON, or SARIF)
```

## Rule System

### Rule Interface

Every rule implements the `Rule` interface:

```typescript
interface Rule {
  id: string;                    // Unique identifier (e.g., 'php-compat-each')
  description: string;           // Human-readable description
  severity: Severity;            // 'error' | 'warning' | 'info'
  category: string;              // 'compatibility' | 'security' | 'best-practice'
  platform: Platform | 'all';   // Target platform
  check: (code: string, filePath: string) => LintResult[];
  minPhpVersion?: PhpVersion;    // Version constraint (optional)
  minWhmcsVersion?: WhmcsVersion;
  minCpanelVersion?: CpanelVersion;
}
```

### Rule Categories

| Category | Purpose |
|----------|---------|
| `compatibility` | Version-specific API changes and deprecations |
| `security` | SQL injection, XSS, path traversal, hardcoded credentials |
| `best-practice` | Code quality, error handling, documentation |

### Rule Registration

All rules are defined in `packages/core/src/rules/index.ts` and organized into arrays:
- `phpRules` -- PHP/WHMCS platform rules
- `perlRules` -- Perl/cPanel platform rules
- `openpanelRules` -- OpenPanel platform rules
- `crossPlatformRules` -- Rules that apply to all platforms
- `allRules` -- Combined array of all rules

### Version-Aware Rules

Rules can specify a `minPhpVersion`, `minWhmcsVersion`, or `minCpanelVersion`. The analyzer will only execute rules whose version constraint matches the target version. For example, `php-compat-each` has `minPhpVersion: '8.0'` because `each()` was removed in PHP 8.0.

## Configuration

### Configuration File

HostingLint searches for configuration files up the directory tree:
1. `.hostinglintrc.json`
2. `.hostinglintrc`
3. `hostinglint.config.json`

```json
{
  "rules": {
    "whmcs-metadata": "off",
    "security-sql-injection": "error"
  },
  "phpVersion": "8.1",
  "ignore": ["vendor/**", "node_modules/**"]
}
```

### Inline Disabling

```php
// hostinglint-disable-next-line security-sql-injection
$result = mysql_query("SELECT * FROM users WHERE id = " . $_GET['id']);

// hostinglint-disable security-xss
echo $_GET['name'];
// hostinglint-enable security-xss
```

## Output Formats

### Text (default)
Human-readable output similar to ESLint, written to stderr.

### JSON
Machine-readable format written to stdout for piping.

### SARIF
Static Analysis Results Interchange Format, compatible with GitHub Code Scanning. Written to stdout.

## Testing

- Framework: Vitest with globals
- Every rule has positive (detection) and negative (no false positive) tests
- Integration tests verify the CLI API
- Type safety tests verify the type system

## Security Principles

1. **No code execution** -- All analysis is regex-based string matching
2. **No runtime dependencies** -- No PHP or Perl runtime required
3. **Read-only** -- HostingLint never writes to analyzed files
4. **No network** -- Core analysis is fully offline
