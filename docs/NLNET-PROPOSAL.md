# NLnet NGI Zero Commons Fund - Grant Proposal Draft

**Submission deadline:** April 1, 2026
**Submit at:** https://nlnet.nl/propose/
**Call:** NGI Zero Commons Fund

---

## Proposal Name

HostingLint - Static Analysis Toolkit for Hosting Control Panel Modules

## Website

https://github.com/Stdubic/hostinglint

## Abstract

HostingLint is an open-source static analysis toolkit (MIT license) that validates hosting control panel modules for security vulnerabilities, version compatibility, and best practices. It supports WHMCS (PHP), cPanel (Perl), and OpenPanel (Docker) -- the three major hosting platforms that collectively manage infrastructure for millions of websites worldwide.

The hosting industry lacks domain-specific static analysis tooling. General-purpose linters like PHPStan or Perl::Critic cannot detect hosting-specific issues such as deprecated WHMCS API calls, insecure cPanel plugin patterns, or misconfigured Docker extensions. HostingLint fills this gap as a public good: a free CLI tool and npm library that runs safely without executing any analyzed code.

The project currently has 31 lint rules across 3 platforms (16 PHP/WHMCS, 7 Perl/cPanel, 5 OpenPanel, 3 cross-platform), a full CLI with SARIF output for CI/CD integration, configuration file support, inline rule disabling, and version-aware analysis. With NGI Zero Commons Fund support, we will expand to 50+ rules, add auto-fix capabilities, build a plugin system for community-contributed rules, create comprehensive documentation, and publish a v1.0 stable release after a security audit.

HostingLint contributes to the Next Generation Internet vision by improving the security and reliability of the hosting infrastructure layer that underpins web services. Better hosting modules mean fewer security breaches, better compatibility, and a more trustworthy internet.

## Previous Involvement

The applicant has extensive experience in the hosting industry, having developed WHMCS modules, cPanel plugins, and hosting automation tools. The related project ModuleForge (a proprietary SaaS for hosting module development) uses @hostinglint/core as a dependency, validating the tool's real-world utility. The HostingLint project has been architected with clear separation from proprietary code and follows an open-core model similar to ESLint/Prettier ecosystem projects.

## Requested Amount

EUR 35,000

## Budget Breakdown

| Task | Effort (hrs) | Rate (EUR/hr) | Cost (EUR) |
|------|-------------|---------------|------------|
| **M1: Rule engine expansion** | 120 | 50 | 6,000 |
| Expand to 50+ rules across all platforms | | | |
| PHP 8.4 and WHMCS 8.14 compatibility rules | | | |
| Version-conditional rule improvements | | | |
| **M2: Auto-fix and plugin system** | 140 | 50 | 7,000 |
| Auto-fix capability for common issues | | | |
| Plugin API for community-contributed rules | | | |
| Shared configurations (recommended, strict) | | | |
| **M3: Developer experience** | 100 | 50 | 5,000 |
| IDE extensions (VS Code, PhpStorm) | | | |
| Pre-commit hook integration | | | |
| Interactive rule playground | | | |
| **M4: Documentation and community** | 80 | 50 | 4,000 |
| Documentation website (GitHub Pages) | | | |
| Comprehensive rule documentation with examples | | | |
| Video tutorials and migration guides | | | |
| **M5: Security and quality** | 80 | 50 | 4,000 |
| Security audit coordination | | | |
| Accessibility review of CLI output | | | |
| Performance benchmarking and optimization | | | |
| **M6: v1.0 release and ecosystem** | 100 | 50 | 5,000 |
| npm v1.0 stable release | | | |
| Integration with ModuleForge and hosting tools | | | |
| Community governance setup | | | |
| **Project management and reporting** | 80 | 50 | 4,000 |
| Progress reports, milestone documentation | | | |
| Community engagement and support | | | |
| **Total** | **700** | | **35,000** |

## Other Funding Sources

The project has no other funding sources. Development to date has been self-funded. The related ModuleForge SaaS is a separate commercial project that uses @hostinglint/core as a dependency but does not fund HostingLint development directly.

## Comparison with Existing Efforts

| Tool | Scope | Hosting-Specific |
|------|-------|-----------------|
| ESLint | JavaScript | No |
| PHPStan / Psalm | General PHP | No |
| Perl::Critic | General Perl | No |
| Hadolint | Dockerfile | No |
| **HostingLint** | **WHMCS + cPanel + OpenPanel** | **Yes** |

No existing static analysis tool provides domain-specific rules for hosting control panel modules. General tools cannot detect:
- Deprecated WHMCS API calls between specific versions (e.g., select_query deprecated in favor of Capsule ORM)
- cPanel API version migrations (API1 to UAPI)
- OpenPanel extension security patterns (Docker capabilities, resource limits)
- Hosting-specific security patterns (SQL injection via $params, XSS in module output)

## Technical Challenges

1. **Cross-paradigm analysis**: HostingLint is the first tool to span both traditional monolithic hosting platforms (WHMCS/PHP, cPanel/Perl) and next-generation containerized hosting (OpenPanel/Docker). Each paradigm has fundamentally different security models -- traditional platforms face SQL injection, XSS, and file traversal attacks, while containerized platforms face container escape, privilege escalation, and capability abuse. Unifying these under a single analysis engine with consistent output formats (text, JSON, SARIF) requires distinct rule architectures that share common infrastructure.

2. **Version matrix complexity**: Supporting multiple PHP versions (7.4-8.3), WHMCS versions (8.11-8.13), and cPanel versions (v132-v134) creates a combinatorial version matrix. A rule like `php-compat-each` must fire for PHP 8.0+ but not for projects targeting PHP 7.4. The engine must evaluate version-conditional rules at runtime while maintaining sub-millisecond per-file analysis time (current benchmark: 0.13 ms average per file across 31 rules).

3. **False positive minimization**: Regex-based static analysis must carefully avoid flagging patterns in comments, string literals, and placeholder values. HostingLint employs multi-layer filtering: comment detection, string exclusion, context window analysis (checking surrounding lines), and file-type validation. Achieving < 5% false positive rate across three languages requires extensive test coverage (currently 144 tests, 100% coverage on all rule files).

4. **Auto-fix without AST**: Implementing reliable auto-fix using regex-based analysis (no AST parser) while avoiding code corruption requires a conservative approach. Each fix must be validated against edge cases -- for example, replacing `each()` with `foreach` in PHP requires understanding the surrounding loop structure. The planned approach uses targeted replacements with pre/post validation rather than full AST transformation.

5. **Container security for hosting**: OpenPanel's Docker-first architecture introduces a new class of hosting-specific vulnerabilities not covered by general Docker linters like Hadolint. HostingLint detects hosting-specific patterns: extensions running with `privileged: true` (container escape risk), excessive capabilities (`SYS_ADMIN`, `NET_ADMIN`), missing resource limits (denial of service), and unvalidated CLI inputs in extension scripts. Container security is a $3B+ market growing at 25.7% CAGR (Mordor Intelligence, 2025), and 37% of organizations reported container security incidents in 2024.

6. **Plugin isolation**: Building a plugin system that loads community rules safely without executing untrusted code requires careful sandboxing design. Rules must be pure functions (no side effects, no network calls) validated against a strict interface before registration.

## Ecosystem and Engagement

**Target users:**
- WHMCS module developers (50,000+ active WHMCS installations worldwide)
- cPanel plugin developers (cPanel powers ~30% of web hosting, 94% panel market share)
- OpenPanel extension developers (Docker-native hosting panel, emerging since 2024)

**Why OpenPanel matters for NGI:**
HostingLint is not just a linter for legacy hosting platforms. It spans the hosting industry's past (cPanel), present (WHMCS), and future (OpenPanel's containerized architecture). OpenPanel represents the Next Generation Internet's shift toward containerized hosting infrastructure. By supporting Docker-based extensions alongside traditional PHP/Perl modules, HostingLint addresses the urgent container security crisis (42% of security teams cite it as a top concern) while securing legacy platforms that still power millions of websites.

**Current project metrics:**
- 31 lint rules across 3 platforms with 100% test coverage on all rule files
- 144 automated tests, full CI/CD via GitHub Actions
- Sub-millisecond per-file analysis (0.13 ms avg, benchmarked across 14 vulnerable example files)
- SARIF output compatible with GitHub Code Scanning
- Configuration file support, inline rule disabling, watch mode
- Vulnerable example modules demonstrating real-world detection across all 3 platforms

**Engagement plan:**
- Publish on npm with CLI for easy adoption (`npx hostinglint check ./module/`)
- GitHub community with issue templates, discussions, and contributing guides
- SARIF output for GitHub Code Scanning integration
- Blog posts and tutorials on hosting developer forums (WHMCS, cPanel, OpenPanel)
- Presence at hosting industry events and open-source conferences
- Integration with hosting development tools (ModuleForge, cPanel DevKit)
- Open rule submission process with community-contributed rules via plugin system

**Sustainability:**
- MIT license ensures permanent availability
- npm packages enable easy distribution and adoption
- Open-core model: free CLI/library, with ModuleForge SaaS as downstream consumer
- Community contribution model (like ESLint) for long-term rule maintenance
- Plugin system (M2 milestone) enables community-contributed rule packages

---

## Submission Checklist

- [ ] Review the [Guide for Applicants](https://nlnet.nl/commonsfund/guideforapplicants/)
- [ ] Review the [52-Day Action Plan](./NLNET-ACTION-PLAN.md)
- [ ] Prepare this proposal text for the online form (see `NLNET-APPLICATION-FORM-FIELDS.md`, `NLNET-SUBMIT-GUIDE.md`)
- [x] Architecture document ([ARCHITECTURE.md](./ARCHITECTURE.md))
- [x] Milestone roadmap ([MILESTONE-ROADMAP.md](./MILESTONE-ROADMAP.md))
- [x] Security model ([SECURITY-MODEL.md](./SECURITY-MODEL.md))
- [x] Performance benchmarks ([BENCHMARKS.md](./BENCHMARKS.md))
- [x] Rules roadmap ([RULES-ROADMAP.md](./RULES-ROADMAP.md))
- [x] OpenPanel strategic analysis ([NLNET-OPENPANEL-STRATEGIC-IMPORTANCE.md](./NLNET-OPENPANEL-STRATEGIC-IMPORTANCE.md))
- [x] SECURITY.md vulnerability reporting policy
- [x] Publish @hostinglint/core and hostinglint to npm (see `NPM-PUBLISH.md`)
- [x] Convert supporting docs to PDF for attachment (`npm run docs:nlnet-pdf` → `docs/nlnet-pdf/`)
- [ ] Submit at https://nlnet.nl/propose/ before April 1, 2026 (`NLNET-SUBMIT-GUIDE.md`)
- [ ] Disclose AI usage if applicable
