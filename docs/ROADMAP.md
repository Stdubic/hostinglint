# HostingLint Roadmap

Public roadmap for HostingLint development. Updated February 2026.

## Current Status: v0.1.0 (Alpha)

HostingLint is functional with 28 rules across 3 platforms, a full CLI, and multiple output formats.

---

## Phase 1: Core Rule Engine (Q1 2026) -- COMPLETED

- [x] PHP/WHMCS analyzer with 13 rules
- [x] Perl/cPanel analyzer with 7 rules
- [x] OpenPanel analyzer with 5 rules
- [x] Cross-platform security rules (3 rules)
- [x] CLI with text, JSON, and SARIF output
- [x] Configuration file support (.hostinglintrc.json)
- [x] Inline rule disabling via comments
- [x] Version-aware rule checking (PHP 7.4-8.3, cPanel v132-v134)
- [x] Watch mode for development
- [x] CI/CD with GitHub Actions

## Phase 2: Rule Expansion (Q2 2026)

- [ ] 50+ rules across all platforms
- [ ] WHMCS version-specific deprecation rules (8.11, 8.12, 8.13)
- [ ] PHP 8.4 compatibility rules
- [ ] cPanel v135 compatibility rules
- [ ] OpenPanel REST API validation rules
- [ ] Performance-focused rules (N+1 queries, large loops)

## Phase 3: Developer Experience (Q2-Q3 2026)

- [ ] Auto-fix capability for common issues
- [ ] Plugin system for custom rules
- [ ] IDE extensions (VS Code, PhpStorm)
- [ ] Pre-commit hook integration
- [ ] Shared configurations (recommended, strict, security-only)

## Phase 4: Ecosystem Growth (Q3-Q4 2026)

- [ ] Documentation website (GitHub Pages)
- [ ] Interactive rule playground
- [ ] Community rule repository
- [ ] Integration with ModuleForge SaaS
- [ ] Benchmark and performance optimization

## Phase 5: v1.0 Stable Release (Q4 2026)

- [ ] Security audit (via NLnet/Radically Open Security)
- [ ] Accessibility review of CLI output
- [ ] npm v1.0 stable release
- [ ] Comprehensive documentation and migration guides
- [ ] Community governance model

---

## How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved. We welcome:
- New rule implementations
- Bug reports and feature requests
- Documentation improvements
- Test coverage improvements

## Funding

HostingLint is seeking funding through the [NLnet NGI Zero Commons Fund](https://nlnet.nl/commonsfund/) to accelerate development. See the project [README](../README.md) for details.
