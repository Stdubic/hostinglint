# HostingLint

Static analysis toolkit for hosting control panel modules. Validates WHMCS (PHP), cPanel (Perl), and OpenPanel modules for syntax, compatibility, security, and best practices.

## Quick Start

```bash
npx hostinglint check ./my-module/
```

Or install globally:

```bash
npm install -g hostinglint
hostinglint check ./my-module/
```

## Example Output

```
  mymodule.php
    L12:  error    PHP 8.3 incompatible: each() removed in PHP 8.0    php-compat-each
    L45:  warning  Missing MetaData() function (required WHMCS 8.0+)   whmcs-metadata
    L78:  error    SQL injection via unsanitized $params['domain']      security-sql-injection
    L102: warning  Deprecated WHMCS function: getClientsDetails()       whmcs-deprecated
    L156: info     Consider using localAPI() instead of direct DB       best-practice

  hooks.php
    L8:   warning  Hook callback should include try/catch error handling  whmcs-hook-error-handling

  7 problems (2 errors, 4 warnings, 1 info)
```

## Features

- **WHMCS module analysis** — PHP 7.4-8.3 compatibility, WHMCS 8.11-8.13 API rules, security checks
- **cPanel plugin analysis** — Perl 5.36+, cPanel v132-v134 compatibility, taint detection
- **OpenPanel extension analysis** — Dockerfile best practices, OpenCLI compatibility
- **Multiple output formats** — Human-readable text, JSON, SARIF (GitHub Code Scanning)
- **Zero runtime dependencies** — Works on code strings, no PHP or Perl runtime needed
- **CI/CD ready** — GitHub Actions integration via SARIF output

## Usage

### CLI

```bash
# Check a directory
hostinglint check ./my-whmcs-module/

# Check a single file
hostinglint check ./mymodule.php

# Specify platform explicitly
hostinglint check ./module/ --platform whmcs

# Target a specific PHP version
hostinglint check ./module/ --php-version 8.1

# JSON output (for piping)
hostinglint check ./module/ --format json

# SARIF output (for GitHub Code Scanning)
hostinglint check ./module/ --format sarif > results.sarif

# Disable security checks
hostinglint check ./module/ --no-security

# Disable best practice checks
hostinglint check ./module/ --no-best-practices
```

### Library

```typescript
import { analyzePhp, analyzePerl, analyzeOpenPanel } from '@hostinglint/core';

// Analyze a WHMCS module
const phpResults = analyzePhp(phpCode, 'mymodule.php', {
  phpVersion: '8.3',
  whmcsVersion: '8.13',
  security: true,
});

// Analyze a cPanel plugin
const perlResults = analyzePerl(perlCode, 'plugin.pl', {
  cpanelVersion: 'v134',
  security: true,
});

// Analyze an OpenPanel extension
const opResults = analyzeOpenPanel(dockerfile, 'Dockerfile');
```

## Rules

### PHP / WHMCS

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `php-compat-each` | error | Detects `each()` usage (removed in PHP 8.0) |
| `whmcs-metadata` | warning | Missing MetaData() function (required WHMCS 8.0+) |
| `security-sql-injection` | error | SQL injection via unsanitized input |
| `whmcs-deprecated` | warning | Usage of deprecated WHMCS functions |
| `whmcs-hook-error-handling` | warning | Hook callbacks without try/catch |

### Perl / cPanel

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `perl-strict-warnings` | warning | Missing `use strict` / `use warnings` |
| `perl-security-taint` | error | Untainted input in system/exec calls |

### OpenPanel

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `openpanel-dockerfile` | warning | Dockerfile best practices (USER, HEALTHCHECK) |

## Development

```bash
# Clone the repo
git clone https://github.com/Stdubic/hostinglint.git
cd hostinglint

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Type check
npm run typecheck

# Build all packages
npm run build

# Full validation
npm run validate
```

## Architecture

HostingLint is an npm workspace monorepo:

- **`@hostinglint/core`** — Analysis engine with all rules and analyzers
- **`hostinglint`** — CLI binary powered by Commander.js

Analysis is regex-based pattern matching on code strings. No PHP or Perl runtime is required, making it safe and portable.

## Contributing

Contributions are welcome! See the rule development guide in `.cursor/rules/hostinglint.mdc` for how to add new rules.

## License

MIT
