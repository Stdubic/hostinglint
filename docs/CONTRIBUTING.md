# Contributing to HostingLint

Thank you for your interest in contributing to HostingLint! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm (comes with Node.js)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Stdubic/hostinglint.git
cd hostinglint

# Install dependencies
npm install

# Run the full validation suite
npm run validate
```

### Development Commands

```bash
npm run build        # Build all packages
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Tests with coverage report
npm run validate     # Full validation (lint + typecheck + test + build)
```

## Adding a New Rule

This is the most common type of contribution. Follow these steps:

### 1. Choose Your Rule

Before starting, check the [existing rules](RULES.md) to avoid duplicates. Good rule ideas:
- PHP function deprecations/removals in specific versions
- WHMCS API changes between versions
- Security vulnerabilities (SQL injection, XSS, etc.)
- Perl/cPanel best practices
- OpenPanel extension issues

### 2. Define the Rule

Edit `packages/core/src/rules/index.ts` and add your rule definition:

```typescript
/**
 * Rule: [Brief description of what it detects]
 */
const myNewRule: Rule = {
  id: 'platform-category-name',       // e.g., 'php-compat-match'
  description: 'Human-readable description.',
  severity: 'error',                   // 'error' | 'warning' | 'info'
  category: 'compatibility',           // 'compatibility' | 'security' | 'best-practice'
  platform: 'whmcs',                   // 'whmcs' | 'cpanel' | 'openpanel' | 'all'
  minPhpVersion: '8.0',               // Optional: version constraint
  check: (code: string, filePath: string): LintResult[] => {
    const results: LintResult[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/your-pattern-here/);
      if (match && match.index !== undefined) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          message: 'Description of the issue found.',
          ruleId: 'platform-category-name',
          severity: 'error',
          category: 'compatibility',
          fix: 'Suggested fix for the issue.',
        });
      }
    }

    return results;
  },
};
```

### 3. Register the Rule

Add your rule to the appropriate array at the bottom of the rules file:

```typescript
export const phpRules: Rule[] = [
  // ... existing rules
  myNewRule,  // Add here
];
```

### 4. Write Tests

Add tests in the appropriate test file (`packages/core/tests/analyzers/php.test.ts`, `perl.test.ts`, etc.):

```typescript
describe('My new rule', () => {
  it('should detect the issue (positive case)', () => {
    const code = `<?php
// Code that should trigger the rule
`;
    const results = analyzePhp(code, 'test.php');
    const ruleResults = results.filter((r) => r.ruleId === 'platform-category-name');
    expect(ruleResults.length).toBeGreaterThanOrEqual(1);
  });

  it('should not flag safe code (negative case)', () => {
    const code = `<?php
// Code that should NOT trigger the rule
`;
    const results = analyzePhp(code, 'test.php');
    const ruleResults = results.filter((r) => r.ruleId === 'platform-category-name');
    expect(ruleResults).toHaveLength(0);
  });
});
```

### 5. Run Validation

```bash
npm run validate
```

All tests must pass, and there should be no TypeScript or ESLint errors.

## Rule Guidelines

- **Pure functions**: Rules must not have side effects (no I/O, no network)
- **No exceptions**: Return empty array `[]` if nothing found, never throw
- **Line numbers**: Always include accurate `line` (1-indexed) and `column` (1-indexed)
- **Fix suggestions**: Include a `fix` field when there is a clear remediation
- **Regex-based**: Use regex pattern matching, no code execution
- **Unique IDs**: Follow the pattern `{platform}-{category}-{name}`

## Code Style

- TypeScript strict mode -- avoid `any`, use proper types
- Use `interface` for object shapes, `type` for unions/literals
- Use `.js` extension in relative import paths (Node16 module resolution)
- All functions should have JSDoc comments
- Use `const` over `let`, never use `var`

## Pull Request Process

1. Fork the repository and create a feature branch
2. Make your changes following the guidelines above
3. Ensure `npm run validate` passes
4. Write a clear PR description explaining the change
5. Link any related issues

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps for bugs
- For security vulnerabilities, please email directly (do not open a public issue)

## Code of Conduct

See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
