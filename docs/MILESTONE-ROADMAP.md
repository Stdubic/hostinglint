# HostingLint Milestone Roadmap

**For:** NLnet NGI Zero Commons Fund Application
**Date:** February 2026
**Total Budget:** EUR 35,000
**Timeline:** 12 months (Q2 2026 - Q1 2027)

---

## Milestone Overview

| Milestone | Description | Hours | Cost (EUR) | Timeline |
|-----------|-------------|-------|------------|----------|
| M1 | Rule Engine Expansion | 120 | 6,000 | Months 1-3 |
| M2 | Auto-Fix and Plugin System | 140 | 7,000 | Months 3-5 |
| M3 | Developer Experience | 100 | 5,000 | Months 5-7 |
| M4 | Documentation and Community | 80 | 4,000 | Months 7-9 |
| M5 | Security and Quality | 80 | 4,000 | Months 9-10 |
| M6 | v1.0 Release and Ecosystem | 100 | 5,000 | Months 10-12 |
| PM | Project Management | 80 | 4,000 | Throughout |
| **Total** | | **700** | **35,000** | |

---

## M1: Rule Engine Expansion (120 hours, EUR 6,000)

**Objective:** Expand from 28 to 50+ rules across all three platforms.

### Deliverables

1. **8 Priority 1 rules** — High-impact security vulnerabilities
   - `security-php-deserialization` — Insecure unserialize() (CWE-502)
   - `security-php-ssrf` — Server-side request forgery (CWE-918)
   - `security-php-weak-crypto` — Weak password hashing (CWE-327)
   - `security-perl-sql-injection` — SQL injection via interpolation (CWE-89)
   - `security-perl-cmd-injection` — Command injection detection (CWE-78)
   - `openpanel-security-bind-mounts` — Dangerous host path mounts
   - `openpanel-security-secrets-in-env` — Secrets in ENV variables
   - `security-insecure-random` — Weak RNG for security purposes

2. **6 Priority 2 rules** — PHP 8.2/8.3 compatibility
   - `php-compat-dynamic-properties` — Deprecated in PHP 8.2
   - `php-compat-utf8-encode` — Removed in PHP 8.2
   - `php-compat-dollar-brace` — Deprecated in PHP 8.2
   - `php-compat-null-to-internal` — Deprecated in PHP 8.1
   - `php-compat-implicit-float-conversion` — PHP 8.1 change
   - `php-compat-serializable-interface` — Deprecated in PHP 8.1

3. **4 Priority 3 rules** — WHMCS 8.11-8.13 specific
   - `whmcs-payment-gateway-deprecated`
   - `whmcs-capsule-orm-migration`
   - `whmcs-hook-facade`
   - `whmcs-strict-types`

4. **4+ Priority 4-5 rules** — cPanel UAPI + OpenPanel container
   - `perl-cpanel-api1-functions`
   - `perl-cpanel-api2-to-uapi`
   - `openpanel-security-host-network`
   - `openpanel-security-latest-tag`

### Success Criteria
- 50+ total rules implemented and tested
- 100% test coverage on all rule files
- < 200 ms analysis time for 1000 lines
- Vulnerable examples for all new rules

---

## M2: Auto-Fix and Plugin System (140 hours, EUR 7,000)

**Objective:** Enable automated code fixes and community rule contributions.

### Deliverables

1. **Auto-fix engine** — Machine-applicable fixes for 30+ rules
   - `FixAction` interface with range-based replacements
   - `--fix` CLI flag for automatic application
   - Interactive fix preview mode
   - Dry-run support

2. **Plugin system** — Load external rule packages
   - Plugin interface: `HostingLintPlugin { name, rules }`
   - npm package loading: `plugins: ['@hostinglint-rules/my-rules']`
   - Local file loading for development
   - Plugin validation and sandboxing

3. **Shared configurations** — Preset rule sets
   - `recommended` — balanced defaults
   - `strict` — all rules at error level
   - `security-only` — security rules only
   - Extendable presets via config

### Success Criteria
- 30+ rules with working auto-fix
- Plugin API documented with example package
- 3 preset configurations published

---

## M3: Developer Experience (100 hours, EUR 5,000)

**Objective:** Bring HostingLint into developer workflows.

### Deliverables

1. **VS Code extension** — inline warnings, quick fixes
2. **PhpStorm plugin** — via Language Server Protocol
3. **Pre-commit hook** — `hostinglint check --staged`
4. **GitHub Action** — `hostinglint/action@v1`

### Success Criteria
- VS Code extension published on marketplace
- Pre-commit hook documented and tested
- GitHub Action with SARIF upload

---

## M4: Documentation and Community (80 hours, EUR 4,000)

**Objective:** Comprehensive documentation for users and contributors.

### Deliverables

1. **Documentation website** — GitHub Pages, auto-generated rule catalog
2. **Rule documentation** — each rule with examples, fix suggestions, SARIF output
3. **Migration guides** — PHP 7 to 8, API1 to UAPI, cPanel to OpenPanel
4. **Video tutorials** — CLI walkthrough, CI/CD setup, rule development

### Success Criteria
- Documentation website live at hostinglint.dev or GitHub Pages
- All 50+ rules documented with examples
- 3+ migration guides published

---

## M5: Security and Quality (80 hours, EUR 4,000)

**Objective:** Security audit and quality assurance.

### Deliverables

1. **Security audit** — via NLnet/Radically Open Security
2. **Accessibility review** — CLI output for screen readers
3. **Performance optimization** — benchmarking, profiling, caching
4. **Integration testing** — real-world WHMCS/cPanel/OpenPanel modules

### Success Criteria
- Security audit completed with all findings addressed
- CLI output accessible (WCAG-compatible text)
- Performance under target with 50+ rules

---

## M6: v1.0 Release and Ecosystem (100 hours, EUR 5,000)

**Objective:** Stable release and ecosystem integration.

### Deliverables

1. **npm v1.0 release** — `@hostinglint/core` and `hostinglint` CLI
2. **ModuleForge integration** — updated @hostinglint/core dependency
3. **Community governance** — GOVERNANCE.md, maintainer guidelines
4. **Ecosystem integrations** — cPanel DevKit, WHMCS Marketplace mentions

### Success Criteria
- v1.0.0 published on npm
- Stable API with semver guarantees
- Community governance model documented

---

## Timeline Visualization

```
2026
Q2 (Apr-Jun)    ████████████ M1: Rule Expansion (50+ rules)
                      ██████████████ M2: Auto-Fix + Plugins
Q3 (Jul-Sep)                  ██████████ M3: IDE Extensions
                                    ████████ M4: Documentation
Q4 (Oct-Dec)                              ██████ M5: Security Audit
                                                ████████ M6: v1.0 Release
2027
Q1 (Jan)        PM: Project Management (throughout) ────────────────────►
```

---

*Prepared for NLnet NGI Zero Commons Fund Application, February 2026*
