# Contributing to HostingLint

Thank you for your interest in contributing to HostingLint! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm (comes with Node.js)
- Git

### Setup

```bash
git clone https://github.com/Stdubic/hostinglint.git
cd hostinglint
npm install
npm run validate
```

If `validate` passes (lint + typecheck + tests + build), you're ready.

### Development Commands

```bash
npm run build          # Build all packages
npm run lint           # ESLint
npm run typecheck      # TypeScript type checking
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Tests with coverage report
npm run validate       # Full validation (lint + typecheck + test + build)
```

## Project Structure

```
packages/
  core/                    @hostinglint/core (analysis engine)
    src/
      analyzers/           Platform-specific analyzers (php/, perl/, openpanel/)
      rules/               Rule definitions by platform
        php/               PHP/WHMCS rules (compatibility.ts, security.ts, whmcs.ts)
        perl/              Perl/cPanel rules
        openpanel/         OpenPanel/Docker rules
        common/            Cross-platform rules
      types.ts             Core type definitions
    tests/                 Test suite (mirrors src/ structure)
  cli/                     hostinglint CLI (Commander.js)
examples/
  vulnerable/              Intentionally vulnerable modules for testing
docs/                      Documentation
```

## Adding a New Rule (Step by Step)

This is the most common contribution. Here's how:

### 1. Pick a rule

Check [RULES.md](RULES.md) and open GitHub Issues for planned work to avoid duplicates.

### 2. Create the rule

Add it in the appropriate platform file (e.g., `packages/core/src/rules/php/security.ts`):

```typescript
import type { LintResult, Rule, RuleContext } from '../../types.js';

/**
 * Rule: Detect [what your rule detects]
 */
export const myNewRule: Rule = {
  id: 'platform-category-name',
  description: 'Human-readable description.',
  severity: 'error',
  category: 'security',
  platform: 'whmcs',
  check: (context: RuleContext): LintResult[] => {
    const { code, filePath } = context;
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(?:\/\/|#|\*|\/\*)/.test(line)) continue;

      const match = line.match(/your-regex-pattern/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'What the issue is and why it matters.',
          ruleId: 'platform-category-name',
          severity: 'error',
          category: 'security',
          fix: 'How to fix it.',
        });
      }
    }

    return results;
  },
};
```

### 3. Register the rule

Export it from the platform's `index.ts` and add it to the rules array:

```typescript
// In packages/core/src/rules/php/security.ts (bottom)
export const phpSecurityRules: Rule[] = [
  // ... existing rules
  myNewRule,
];

// In packages/core/src/rules/php/index.ts
export { myNewRule } from './security.js';
```

### 4. Write tests

Add tests in `packages/core/tests/analyzers/php.test.ts` (or `perl.test.ts`, `openpanel.test.ts`):

```typescript
describe('My new rule', () => {
  it('should detect the issue', () => {
    const code = `<?php
$hash = md5($password);
`;
    const results = analyzePhp(code, 'test.php');
    const hits = results.filter((r) => r.ruleId === 'platform-category-name');
    expect(hits).toHaveLength(1);
    expect(hits[0].severity).toBe('error');
  });

  it('should not flag safe code', () => {
    const code = `<?php
$hash = password_hash($password, PASSWORD_BCRYPT);
`;
    const results = analyzePhp(code, 'test.php');
    const hits = results.filter((r) => r.ruleId === 'platform-category-name');
    expect(hits).toHaveLength(0);
  });
});
```

### 5. Update rule count

Update the rule count in `packages/core/tests/rules.test.ts` and `README.md`.

### 6. Validate

```bash
npm run validate
```

Everything must pass. No TypeScript errors, no ESLint warnings, all tests green.

## Rule Guidelines

- **Pure functions**: No side effects (no I/O, no network)
- **Never throw**: Return empty `[]` if no issues found
- **Line numbers**: Always 1-indexed for `line` and `column`
- **Fix suggestions**: Include a `fix` when there's a clear remediation
- **Regex-based**: Pattern matching on strings only, never execute code
- **Skip comments**: Filter out commented lines to avoid false positives
- **Unique IDs**: Format `{platform}-{category}-{name}` (e.g., `security-php-ssrf`)

## Code Style

- TypeScript strict mode -- no `any`
- `interface` for object shapes, `type` for unions
- `.js` extension in relative imports (Node16 module resolution)
- JSDoc comments on exported functions
- `const` over `let`, never `var`

## Pull Request Process

1. Fork the repository and create a feature branch
2. Make your changes
3. Run `npm run validate` -- it must pass
4. Submit a PR with a clear description
5. Link related issues

## Reporting Issues

- Use GitHub Issues for bugs and feature requests
- For security vulnerabilities, see [SECURITY.md](../SECURITY.md)

## Code of Conduct

See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
