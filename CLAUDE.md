# HostingLint - AI Context

## Project Overview

**HostingLint** is an open-source static analysis toolkit for hosting control panel modules. It validates WHMCS (PHP), cPanel (Perl), and OpenPanel modules for syntax correctness, version compatibility, security vulnerabilities, and best practices.

Think of it as "ESLint for hosting modules."

- **License:** MIT
- **Language:** TypeScript (Node.js)
- **Architecture:** npm workspace monorepo (`packages/core` + `packages/cli`)
- **Target grant:** NLnet NGI Zero Commons Fund (April 1, 2026 deadline)
- **Related project:** ModuleForge (proprietary SaaS) uses @hostinglint/core as a dependency

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | TypeScript | ^5 |
| Runtime | Node.js | >=20 |
| Package manager | npm workspaces | - |
| CLI framework | Commander.js | ^13 |
| Testing | Vitest | ^3 |
| Coverage | @vitest/coverage-v8 | ^3 |
| Linting | ESLint (flat config) | ^9 |
| CI/CD | GitHub Actions | - |

## Project Structure

```
hostinglint/
├── packages/
│   ├── core/                  # @hostinglint/core — analysis engine
│   │   ├── src/
│   │   │   ├── analyzers/
│   │   │   │   ├── php/       # PHP/WHMCS analyzer
│   │   │   │   ├── perl/      # Perl/cPanel analyzer
│   │   │   │   └── openpanel/ # OpenPanel analyzer
│   │   │   ├── rules/         # Rule definitions and registry
│   │   │   ├── types.ts       # Core type definitions
│   │   │   └── index.ts       # Public API exports
│   │   └── tests/
│   └── cli/                   # hostinglint CLI
│       ├── src/
│       │   └── cli.ts         # Commander.js CLI entry point
│       └── tests/
├── examples/                  # Sample modules for testing
│   ├── whmcs-sample/          # WHMCS module with intentional issues
│   └── cpanel-sample/         # cPanel plugin with intentional issues
├── docs/                      # Documentation
└── [config files]             # tsconfig, vitest, eslint, etc.
```

## Key Concepts

### Analyzers
Each analyzer validates code for a specific platform:
- **PHP Analyzer** (`packages/core/src/analyzers/php/`) — WHMCS modules
- **Perl Analyzer** (`packages/core/src/analyzers/perl/`) — cPanel plugins
- **OpenPanel Analyzer** (`packages/core/src/analyzers/openpanel/`) — Docker-based extensions

### Rules
Rules are defined in `packages/core/src/rules/index.ts`. Each rule:
- Has a unique `id` (e.g., `php-compat-each`, `security-sql-injection`)
- Belongs to a `category` (syntax, compatibility, security, best-practice)
- Targets a `platform` (whmcs, cpanel, openpanel, or all)
- Has a `check(code, filePath)` function that returns `LintResult[]`

### Analysis Method
- **Regex-based pattern matching** on code strings
- No PHP or Perl runtime required (safe, portable)
- No code execution (static analysis only)

### Output Formats
- **text** — Human-readable (like ESLint output)
- **json** — Machine-readable JSON
- **sarif** — GitHub Code Scanning compatible

## Commands

```bash
npm run lint          # ESLint
npm run lint:ci       # ESLint (zero warnings)
npm run typecheck     # TypeScript type checking
npm run test          # Run all tests
npm run test:ci       # Tests with coverage
npm run build         # Build all packages
npm run validate      # Full validation (lint + typecheck + test + build)
npm run clean         # Remove dist directories
```

## Code Conventions

### TypeScript
- Strict mode enabled — avoid `any`, use proper types
- Use `interface` for object shapes, `type` for unions/literals
- Export types from `types.ts`, re-export from `index.ts`
- Prefer `const` over `let`, never use `var`
- Use `.js` extension in import paths (Node16 module resolution)

### Rules
- Each rule must have a unique `id` following the pattern: `{category}-{description}`
- Categories: `php-compat`, `whmcs-*`, `security-*`, `perl-*`, `openpanel-*`
- Rules must be pure functions (no side effects, no network calls)
- Rules return `LintResult[]` — never throw exceptions
- Always include `file`, `line`, `column` in results

### Testing
- Framework: Vitest with globals
- Test files: `packages/*/tests/**/*.test.ts`
- Use `describe`/`it`/`expect` pattern
- Test both positive (issue detected) and negative (no false positive) cases
- Each rule should have at least 2 tests

### Security
- NEVER execute analyzed code (static analysis only)
- NEVER require PHP or Perl runtime
- All analysis happens on string content
- File I/O is read-only

## Platforms & Versions

### WHMCS (PHP)
- PHP versions: 7.4, 8.0, 8.1, 8.2, 8.3
- WHMCS versions: 8.11, 8.12, 8.13
- Key APIs: MetaData(), Config(), *_hook functions, localAPI(), Capsule ORM

### cPanel (Perl)
- Perl 5.36+
- cPanel versions: v132, v133, v134
- Key APIs: Cpanel::JSON, cPanel hooks, WHM API

### OpenPanel
- Docker-based extensions
- OpenCLI commands
- REST API integration

## Relationship to ModuleForge

HostingLint is a **standalone open-source project** (MIT license). ModuleForge (proprietary SaaS) uses `@hostinglint/core` as a dependency for its "Analyze" feature. The two projects have a clean separation:

- HostingLint: free CLI + library, grant-funded, community-driven
- ModuleForge: paid SaaS with visual builder, monitoring, ZIP export

This is an open-core model (like ESLint/Prettier -> Vercel, PHPStan -> Rector).
