# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in HostingLint, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email:** Send a detailed report to **stevandaleksic@gmail.com** with the subject line `[SECURITY] HostingLint vulnerability report`.

2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Affected versions
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix development | Within 14 business days (severity dependent) |
| Public disclosure | After fix is released, coordinated with reporter |

### Scope

The following are in scope for security reports:

- **Rule bypass**: A way to make HostingLint miss a security vulnerability it should detect
- **Code execution**: Any scenario where HostingLint executes analyzed code (should never happen)
- **Plugin security**: Vulnerabilities in the plugin loading mechanism
- **Auto-fix corruption**: Cases where `--fix` corrupts or incorrectly modifies source code
- **Dependency vulnerabilities**: Known CVEs in HostingLint's dependencies

The following are **out of scope**:

- False positives/negatives in lint rules (use GitHub Issues instead)
- Feature requests
- Vulnerabilities in the analyzed code itself (that's what HostingLint detects)

### Security Design

HostingLint is designed with security as a core principle:

- **No code execution**: All analysis is regex-based on string content
- **No runtime required**: No PHP, Perl, or Docker runtime needed
- **Read-only**: Never modifies analyzed files (auto-fix is opt-in)
- **No network access**: Zero network requests during analysis
- **Minimal dependencies**: Zero runtime dependencies in @hostinglint/core

See [docs/SECURITY-MODEL.md](docs/SECURITY-MODEL.md) for the full security model.

## Recognition

We appreciate responsible disclosure and will credit security researchers in our release notes (with permission).
