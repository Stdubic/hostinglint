# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.1] - 2026-03-09

### Fixed
- npm publish workflow made idempotent on reruns
- CLI package.json bin path and repository URL normalized for npm
- Removed --provenance flag from publish workflow for private repos

## [0.1.0] - 2026-03-09

### Added
- Initial public release of `@hostinglint/core` and `hostinglint` CLI
- 32 lint rules across 3 platforms (17 PHP/WHMCS, 7 Perl/cPanel, 5 OpenPanel, 3 cross-platform)
- PHP/WHMCS analyzer with version-aware checks (PHP 7.4-8.4, WHMCS 8.11-8.14)
- Perl/cPanel analyzer with version-aware checks (cPanel v132-v135)
- OpenPanel/Docker analyzer for container extension security
- CLI with text, JSON, and SARIF output formats
- Configuration file support (.hostinglintrc.json)
- Inline rule disabling via comments
- Watch mode for development
- Auto-fix support with --fix flag
- Plugin system for community-contributed rules
- Preset configurations (recommended, strict, security-only)
- VS Code extension with diagnostics, hover, and quick fixes
- Vulnerable example modules for all 3 platforms
- GitHub Actions CI/CD pipeline
- Full test suite (191 tests, 100% rule coverage)

[0.1.1]: https://github.com/Stdubic/hostinglint/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Stdubic/hostinglint/releases/tag/v0.1.0
