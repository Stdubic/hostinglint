# HostingLint Performance Benchmarks

**Date:** February 12, 2026
**Rules:** 32 across 3 platforms
**Runtime:** Node.js v24.13.0, macOS
**Method:** 100 iterations per file, average and P95 reported

## Results

| File | Analyzer | Lines | Issues | Avg (ms) | P95 (ms) |
|------|----------|-------|--------|----------|----------|
| cpanel-vulnerable/deprecated_syntax.pl | Perl | 118 | 0 | 0.21 | 0.34 |
| cpanel-vulnerable/hardcoded_credentials.pl | Perl | 103 | 6 | 0.16 | 0.22 |
| cpanel-vulnerable/sql_injection.pl | Perl | 104 | 9 | 0.15 | 0.21 |
| cpanel-vulnerable/unsafe_file_operations.pl | Perl | 91 | 5 | 0.12 | 0.15 |
| openpanel-vulnerable/Dockerfile | OpenPanel | 23 | 2 | 0.02 | 0.02 |
| openpanel-vulnerable/deploy.py | OpenPanel | 21 | 4 | 0.01 | 0.01 |
| openpanel-vulnerable/docker-compose.yml | OpenPanel | 34 | 6 | 0.01 | 0.02 |
| openpanel-vulnerable/manifest.json | OpenPanel | 8 | 1 | 0.00 | 0.00 |
| openpanel-vulnerable/setup.sh | OpenPanel | 18 | 1 | 0.01 | 0.01 |
| whmcs-vulnerable/deprecated_functions.php | PHP | 61 | 8 | 0.24 | 0.32 |
| whmcs-vulnerable/insecure_api_calls.php | PHP | 90 | 5 | 0.30 | 0.39 |
| whmcs-vulnerable/sql_injection.php | PHP | 64 | 6 | 0.22 | 0.28 |
| whmcs-vulnerable/xss_vulnerability.php | PHP | 57 | 1 | 0.19 | 0.25 |

## Summary

| Metric | Value |
|--------|-------|
| Files analyzed | 13 |
| Total lines | 792 |
| Total issues detected | 54 |
| Combined avg analysis time | 1.63 ms |
| Average per-file | 0.13 ms |
| Target | < 100 ms per 1000 lines |

**Result: PASS** -- Total analysis time is well within the target threshold. The regex-based static analysis approach delivers sub-millisecond per-file performance, making HostingLint suitable for real-time IDE integration and CI/CD pipelines.

## Key Observations

- **PHP analysis** is the heaviest (~0.2-0.3 ms/file) due to the most rules (13 PHP + 3 cross-platform).
- **OpenPanel analysis** is the fastest (< 0.02 ms/file) with pattern-targeted rules on smaller files.
- **Perl analysis** falls in between (~0.1-0.2 ms/file) with 7 platform rules + 3 cross-platform.
- Even with 100 iterations, no file exceeds 0.4 ms at P95, confirming consistent low latency.

## Scaling Projections

At ~0.3 ms per 100-line PHP file with all 32 rules:
- 1,000-line module: ~3 ms (well under 100 ms target)
- 5,000-line project: ~15 ms
- 10,000-line project: ~30 ms

With the planned expansion to 50+ rules, projected analysis time would be ~2x current (still under target).
