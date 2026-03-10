# Collaborator Onboarding Guide

Welcome to HostingLint! This document helps new collaborators get started quickly.

## What is HostingLint?

HostingLint is a free, open-source linter for hosting control panel modules. It checks code for security vulnerabilities, compatibility issues, and bad practices across three platforms:

- **WHMCS** (PHP) -- the most popular hosting billing platform
- **cPanel** (Perl) -- powers 94% of hosting control panels
- **OpenPanel** (Docker) -- next-generation containerized hosting

It works like ESLint but for hosting modules. No PHP or Perl runtime needed -- it's all regex-based pattern matching in TypeScript.

## Quick Setup (5 minutes)

```bash
git clone https://github.com/Stdubic/hostinglint.git
cd hostinglint
npm install
npm run validate
```

If you see all green (lint, typecheck, 144 tests pass, build), you're ready.

## Project Status

- **Version:** 0.1.0 (alpha)
- **Rules:** 31 across 3 platforms
- **Tests:** 144 (100% coverage on rule files)
- **Grant:** Applying to NLnet NGI Zero Commons Fund (EUR 35,000, deadline April 1, 2026)
- **License:** MIT

## How You Can Help

### Easy Tasks (start here)

| Task | Difficulty | Time | Where |
|------|-----------|------|-------|
| Add a PHP compatibility rule | Easy | 1-2 hours | `packages/core/src/rules/php/` |
| Add a Perl security rule | Easy | 1-2 hours | `packages/core/src/rules/perl/` |
| Add an OpenPanel Docker rule | Easy | 1-2 hours | `packages/core/src/rules/openpanel/` |
| Add vulnerable example files | Easy | 30 min | `examples/vulnerable/` |
| Improve documentation | Easy | 30 min | `docs/` |
| Fix a TODO/FIXME in code | Easy | 30 min | Search codebase |

### Medium Tasks

| Task | Difficulty | Time | Where |
|------|-----------|------|-------|
| Implement a Priority 2 rule from the roadmap | Medium | 2-3 hours | See `docs/RULES-ROADMAP.md` |
| Add auto-fix to an existing rule | Medium | 2-3 hours | `packages/core/src/rules/` |
| Improve false positive filtering | Medium | 2-3 hours | Any rule file |
| Add integration tests with real modules | Medium | 3-4 hours | `packages/core/tests/` |

### Priority Rules Needed (from roadmap)

These are the next rules we want to implement. Pick one and go:

**PHP 8.2/8.3 Compatibility (any of these):**
- `php-compat-dynamic-properties` -- dynamic properties deprecated in PHP 8.2
- `php-compat-utf8-encode` -- utf8_encode/decode removed in PHP 8.2
- `php-compat-dollar-brace` -- `"${var}"` deprecated in PHP 8.2

**WHMCS Specific:**
- `whmcs-payment-gateway-deprecated` -- deprecated payment gateways
- `whmcs-capsule-orm-migration` -- direct DB queries vs Capsule ORM
- `whmcs-strict-types` -- missing strict_types declaration

**cPanel UAPI:**
- `perl-cpanel-api1-functions` -- specific API1 functions with UAPI equivalents
- `perl-cpanel-api2-to-uapi` -- API2 to UAPI migration hints

**OpenPanel:**
- `openpanel-security-host-network` -- host network mode
- `openpanel-security-latest-tag` -- using :latest tag

Full specs with regex patterns are in `docs/RULES-ROADMAP.md`.

## How to Add a Rule (Simple Version)

1. **Pick a rule** from the list above
2. **Open the right file** (e.g., `packages/core/src/rules/php/compatibility.ts`)
3. **Copy an existing rule** and change the regex pattern, ID, and message
4. **Add it to the rules array** at the bottom of the file
5. **Export it** from the platform's `index.ts`
6. **Write 2 tests** -- one that should trigger, one that should not
7. **Run `npm run validate`** -- must pass
8. **Submit a PR**

See `docs/CONTRIBUTING.md` for the full guide with code examples.

## Key Files

| File | What it does |
|------|-------------|
| `packages/core/src/types.ts` | All TypeScript types (Rule, LintResult, etc.) |
| `packages/core/src/rules/php/security.ts` | PHP security rules (good examples) |
| `packages/core/src/rules/php/compatibility.ts` | PHP version compat rules |
| `packages/core/src/rules/perl/security.ts` | Perl security rules |
| `packages/core/src/rules/openpanel/security.ts` | OpenPanel Docker rules |
| `packages/core/tests/analyzers/php.test.ts` | PHP tests (follow this pattern) |
| `docs/RULES-ROADMAP.md` | Detailed specs for 22 planned rules |
| `docs/RULES.md` | Documentation of all current rules |

## Communication

- **GitHub Issues:** For bugs, feature requests, and rule proposals
- **Pull Requests:** For code contributions
- **Email:** stevandaleksic@gmail.com for questions

## Important Rules

- Never execute analyzed code (static analysis only)
- Never use `any` in TypeScript
- Always include tests (positive + negative case)
- Always run `npm run validate` before submitting
- Use `.js` extensions in import paths

---

## Email Template for Inviting Collaborators

Copy and customize the email below:

---

**Subject:** Invitation to collaborate on HostingLint (open-source hosting linter)

Hi [Name],

I'm working on an open-source project called **HostingLint** -- a static analysis toolkit for hosting control panel modules (WHMCS, cPanel, OpenPanel). Think of it as ESLint but for hosting modules.

The project is MIT-licensed, built with TypeScript/Node.js, and we're applying for an NLnet NGI Zero Commons Fund grant (EUR 35,000).

**Current status:**
- 31 lint rules across 3 platforms
- 144 automated tests, full CI/CD
- Sub-millisecond analysis performance
- GitHub: https://github.com/Stdubic/hostinglint

**How you can help:**
- Add new lint rules (regex patterns that detect security issues or deprecated code)
- Review the grant proposal and give feedback
- Test the tool against real WHMCS/cPanel modules
- Improve documentation

It's beginner-friendly -- adding a rule takes 1-2 hours and there's a step-by-step guide. No PHP or Perl knowledge needed, just TypeScript.

**To get started:**
1. I'll add you as a collaborator on GitHub
2. Clone the repo: `git clone https://github.com/Stdubic/hostinglint.git`
3. Run `npm install && npm run validate`
4. Pick a rule from the roadmap: `docs/RULES-ROADMAP.md`
5. Read the contributor guide: `docs/CONTRIBUTING.md`

Let me know if you're interested and I'll send the GitHub invite!

Best,
Stevan

---

## How to Add a GitHub Collaborator

1. Go to https://github.com/Stdubic/hostinglint/settings/access
2. Click "Add people"
3. Enter their GitHub username or email
4. Set permission to "Write" (allows pushing branches and creating PRs)
5. They'll receive an email invitation to accept

---

*Last updated: March 2026*
