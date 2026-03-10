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

- **31 lint rules** across 3 platforms (WHMCS, cPanel, OpenPanel)
- **WHMCS module analysis** — PHP 7.4-8.3 compatibility, WHMCS 8.11-8.13 API rules, security checks
- **cPanel plugin analysis** — Perl 5.36+, cPanel v132-v134 compatibility, taint detection
- **OpenPanel extension analysis** — Dockerfile best practices, Docker security, OpenCLI validation
- **Version-aware rules** — Rules adapt based on target PHP/WHMCS/cPanel version
- **Configuration file** — `.hostinglintrc.json` for project-specific settings
- **Inline disabling** — Suppress rules via code comments
- **Watch mode** — `--watch` flag for automatic re-analysis on file changes
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

31 rules across 3 platforms. See [docs/RULES.md](docs/RULES.md) for full documentation.

### PHP / WHMCS (16 rules)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `php-compat-each` | error | Detects `each()` usage (removed in PHP 8.0) |
| `php-compat-create-function` | error | Detects `create_function()` (removed in PHP 8.0) |
| `php-compat-mysql-functions` | error | Detects `mysql_*` functions (removed in PHP 7.0) |
| `php-compat-curly-braces` | error | Curly brace array access (deprecated PHP 7.4) |
| `whmcs-metadata` | warning | Missing MetaData() function (required WHMCS 8.0+) |
| `whmcs-deprecated` | warning | Usage of deprecated WHMCS functions |
| `whmcs-config-function` | warning | Missing _Config() in provisioning modules |
| `whmcs-hook-error-handling` | warning | Hook callbacks without try/catch |
| `whmcs-return-format` | warning | Provisioning functions with wrong return format |
| `whmcs-license-check` | info | Missing license validation |
| `security-sql-injection` | error | SQL injection via unsanitized input |
| `security-xss` | error | XSS via unescaped output |
| `security-path-traversal` | error | Path traversal via user input in file ops |
| `security-php-deserialization` | error | Insecure unserialize() with user data (CWE-502) |
| `security-php-ssrf` | error | SSRF via user-controlled URLs (CWE-918) |
| `security-php-weak-crypto` | error | Weak password hashing with MD5/SHA1 (CWE-327) |

### Perl / cPanel (7 rules)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `perl-strict-warnings` | warning | Missing `use strict` / `use warnings` |
| `perl-security-taint` | error | Untainted input in system/exec calls |
| `perl-cpanel-api-version` | warning | Deprecated cPanel API1 usage |
| `perl-file-permissions` | warning | Insecure file permission modes |
| `perl-error-handling` | warning | Critical operations without eval/die |
| `perl-deprecated-modules` | warning | Deprecated Perl modules (CGI.pm, etc.) |
| `perl-input-validation` | warning | CGI params used without validation |

### OpenPanel (5 rules)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `openpanel-dockerfile` | warning | Dockerfile best practices (USER, HEALTHCHECK) |
| `openpanel-api-versioning` | warning | Missing API version in manifest |
| `openpanel-resource-limits` | warning | Docker containers without resource limits |
| `openpanel-security-capabilities` | error | Excessive Docker capabilities |
| `openpanel-cli-validation` | warning | CLI scripts without input validation |

### Cross-Platform (3 rules)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `security-hardcoded-credentials` | error | Hardcoded passwords/API keys |
| `security-eval-usage` | warning | Usage of eval() |
| `best-practice-todo-fixme` | info | TODO/FIXME comments |

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

## Configuration

Create a `.hostinglintrc.json` in your project root:

```json
{
  "rules": {
    "whmcs-license-check": "off",
    "security-sql-injection": "error"
  },
  "phpVersion": "8.1",
  "ignore": ["vendor/**", "node_modules/**"]
}
```

### Inline Disabling

```php
// hostinglint-disable-next-line rule-id
$result = legacy_function();

// hostinglint-disable rule-id
// ... code ...
// hostinglint-enable rule-id
```

## Contributing

Contributions are welcome! See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for how to get started.

## Funding

HostingLint is an open-source project seeking funding through the [NLnet NGI Zero Commons Fund](https://nlnet.nl/commonsfund/) to accelerate development. If you'd like to support the project, consider:

- Contributing code or documentation
- Reporting bugs and suggesting features
- Spreading the word in hosting communities

## License

MIT
