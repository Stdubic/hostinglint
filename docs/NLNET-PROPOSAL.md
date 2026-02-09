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

The project currently has 28 lint rules across 3 platforms, a full CLI with SARIF output for CI/CD integration, configuration file support, inline rule disabling, and version-aware analysis. With NGI Zero Commons Fund support, we will expand to 50+ rules, add auto-fix capabilities, build a plugin system for community-contributed rules, create comprehensive documentation, and publish a v1.0 stable release after a security audit.

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

1. **Cross-language analysis**: Analyzing PHP, Perl, and Docker/YAML with a single TypeScript engine requires careful regex pattern design to avoid false positives while maintaining detection accuracy.

2. **Version matrix complexity**: Supporting multiple PHP versions (7.4-8.3), WHMCS versions (8.11-8.13), and cPanel versions (v132-v134) creates a combinatorial version matrix for rule applicability.

3. **Auto-fix without AST**: Implementing reliable auto-fix suggestions using regex-based analysis (no AST) while avoiding code corruption requires conservative approach and extensive testing.

4. **Plugin isolation**: Building a plugin system that loads community rules safely without executing untrusted code requires careful sandboxing design.

## Ecosystem and Engagement

**Target users:**
- WHMCS module developers (50,000+ active WHMCS installations)
- cPanel plugin developers (cPanel powers ~30% of web hosting)
- OpenPanel extension developers (growing open-source hosting panel)

**Engagement plan:**
- Publish on npm with CLI for easy adoption
- GitHub community with issue templates, discussions, and contributing guides
- SARIF output for GitHub Code Scanning integration
- Blog posts and tutorials on hosting developer forums
- Presence at hosting industry events and open-source conferences
- Integration with hosting development tools (ModuleForge, cPanel DevKit)
- Collaboration with WHMCS, cPanel, and OpenPanel communities

**Sustainability:**
- MIT license ensures permanent availability
- npm packages enable easy distribution
- Open-core model: free CLI/library, with potential for premium integrations
- Community contribution model (like ESLint) for long-term rule maintenance

---

## Submission Checklist

- [ ] Review the [Guide for Applicants](https://nlnet.nl/commonsfund/guideforapplicants/)
- [ ] Review the [52-Day Action Plan](./NLNET-ACTION-PLAN.md)
- [ ] Prepare this proposal text for the online form
- [ ] Attach budget breakdown as PDF
- [ ] Attach architecture document
- [ ] Submit at https://nlnet.nl/propose/ before April 1, 2026
- [ ] Disclose AI usage if applicable
