# Vulnerable Module Examples

This directory contains **intentionally vulnerable** hosting control panel modules that demonstrate common security flaws, compatibility issues, and bad practices that HostingLint is designed to detect.

⚠️ **WARNING: DO NOT USE THESE MODULES IN PRODUCTION**

These examples are for testing and demonstration purposes only. They contain deliberate security vulnerabilities.

## Purpose

These vulnerable modules serve multiple purposes:

1. **Demonstrate HostingLint's detection capabilities** — Show what issues the tool can identify
2. **Test rule coverage** — Validate that security and compatibility rules work correctly
3. **Educational resource** — Help developers understand common pitfalls in hosting module development
4. **Grant application evidence** — Prove utility and real-world applicability for NLnet NGI Zero Commons Fund

## Directory Structure

```
vulnerable/
├── whmcs-vulnerable/            # PHP-based WHMCS modules with security flaws
│   ├── sql_injection.php
│   ├── xss_vulnerability.php
│   ├── deprecated_functions.php
│   ├── insecure_api_calls.php
│   └── command_injection.php
├── cpanel-vulnerable/           # Perl-based cPanel plugins with security flaws
│   ├── unsafe_file_operations.pl
│   ├── sql_injection.pl
│   ├── hardcoded_credentials.pl
│   └── deprecated_syntax.pl
└── openpanel-vulnerable/        # Docker-based OpenPanel extensions with security flaws
    ├── Dockerfile               # Missing USER and HEALTHCHECK
    ├── docker-compose.yml       # Privileged mode, excessive capabilities, no resource limits
    ├── manifest.json            # Missing apiVersion field
    ├── setup.sh                 # Shell args without validation
    └── deploy.py                # sys.argv without validation
```

## WHMCS Vulnerable Modules (PHP)

### sql_injection.php

**Vulnerabilities:**
- Direct concatenation of user input in SQL queries
- Use of deprecated `mysql_*` functions
- Unvalidated `$_GET`, `$_POST`, `$_REQUEST` parameters
- Missing input sanitization

**Rules that should trigger:**
- `security-sql-injection`
- `php-compat-mysql-ext`
- `whmcs-best-input-validation`

**Test command:**
```bash
npx hostinglint examples/vulnerable/whmcs-vulnerable/sql_injection.php
```

### xss_vulnerability.php

**Vulnerabilities:**
- Unescaped output of user-controlled data
- Direct `echo` of `$_GET`/`$_POST` variables
- Reflected XSS in search functionality
- User input passed to templates without sanitization

**Rules that should trigger:**
- `security-xss`
- `whmcs-best-input-validation`

**Test command:**
```bash
npx hostinglint examples/vulnerable/whmcs-vulnerable/xss_vulnerability.php
```

### deprecated_functions.php

**Vulnerabilities:**
- `each()` — removed in PHP 7.2
- `create_function()` — removed in PHP 8.0
- `mysql_*` functions — removed in PHP 7.0
- `split()` — removed in PHP 7.0
- `ereg()` — removed in PHP 7.0
- `money_format()` — removed in PHP 8.0
- `call_user_method()` — removed in PHP 7.0

**Rules that should trigger:**
- `php-compat-each`
- `php-compat-create-function`
- `php-compat-mysql-ext`
- `php-compat-split`
- `php-compat-ereg`

**Test command:**
```bash
npx hostinglint examples/vulnerable/whmcs-vulnerable/deprecated_functions.php
```

### insecure_api_calls.php

**Vulnerabilities:**
- Hardcoded API keys and secrets
- HTTP instead of HTTPS
- SSL verification disabled (`CURLOPT_SSL_VERIFYPEER = false`)
- Plain text passwords in API requests
- Sensitive data logged in module calls

**Rules that should trigger:**
- `security-hardcoded-credentials`
- `whmcs-best-https`
- `whmcs-best-ssl-verify`

**Test command:**
```bash
npx hostinglint examples/vulnerable/whmcs-vulnerable/insecure_api_calls.php
```

### command_injection.php

**Vulnerabilities:**
- `exec()` with unsanitized `$params` input
- `shell_exec()` with unsanitized `$params` input
- `system()` with unsanitized `$_POST` input
- `passthru()` with unsanitized `$_REQUEST` input
- `proc_open()` with unsanitized `$_GET` input
- `popen()` with unsanitized `$params` input
- Backtick operator with unsanitized `$_GET` input

**Rules that should trigger:**
- `security-command-injection`

**Test command:**
```bash
npx hostinglint examples/vulnerable/whmcs-vulnerable/command_injection.php
```

## cPanel Vulnerable Plugins (Perl)

### unsafe_file_operations.pl

**Vulnerabilities:**
- Path traversal vulnerabilities (no input validation)
- Command injection via `system()` with user input
- Insecure file permissions (`chmod 0777`)
- Backticks with unescaped user input
- Two-argument `open()` (deprecated)
- Shell metacharacters not escaped

**Rules that should trigger:**
- `security-path-traversal`
- `security-command-injection`
- `perl-security-insecure-permissions`
- `perl-compat-two-arg-open`

**Test command:**
```bash
npx hostinglint examples/vulnerable/cpanel-vulnerable/unsafe_file_operations.pl
```

### sql_injection.pl

**Vulnerabilities:**
- Direct string interpolation in SQL queries
- String concatenation with user input
- Unescaped LIKE clause parameters
- Table names from user input
- No prepared statement usage

**Rules that should trigger:**
- `security-sql-injection`
- `perl-best-prepared-statements`

**Test command:**
```bash
npx hostinglint examples/vulnerable/cpanel-vulnerable/sql_injection.pl
```

### hardcoded_credentials.pl

**Vulnerabilities:**
- Hardcoded database passwords
- Hardcoded API keys and secrets
- JWT tokens in source code
- AWS access keys in code
- SSH passwords in system calls
- Hardcoded encryption keys

**Rules that should trigger:**
- `security-hardcoded-credentials`
- `perl-security-hardcoded-password`

**Test command:**
```bash
npx hostinglint examples/vulnerable/cpanel-vulnerable/hardcoded_credentials.pl
```

### deprecated_syntax.pl

**Vulnerabilities:**
- Unescaped `@` in double-quoted strings (Perl 5.36+)
- Indirect object syntax (`new Class()`)
- Bareword filehandles
- Two-argument `open()`
- Package variables without `our`
- Barewords without quotes

**Rules that should trigger:**
- `perl-compat-indirect-object`
- `perl-compat-two-arg-open`
- `perl-compat-bareword-filehandle`

**Test command:**
```bash
npx hostinglint examples/vulnerable/cpanel-vulnerable/deprecated_syntax.pl
```

## OpenPanel Vulnerable Extensions (Docker)

### Dockerfile

**Issues:**
- Missing `USER` directive — container runs as root
- Missing `HEALTHCHECK` — container failures go undetected

**Rules that should trigger:**
- `openpanel-dockerfile`

**Test command:**
```bash
npx hostinglint examples/vulnerable/openpanel-vulnerable/Dockerfile
```

### docker-compose.yml

**Issues:**
- `privileged: true` — full host access
- Excessive capabilities (`SYS_ADMIN`, `NET_ADMIN`, `ALL`)
- No resource limits (memory/CPU)
- `network_mode: host` — bypasses network isolation
- Hardcoded secrets in environment variables (`DATABASE_PASSWORD`, `API_KEY`, `ADMIN_TOKEN`)

**Rules that should trigger:**
- `openpanel-security-capabilities`
- `openpanel-resource-limits`
- `openpanel-security-host-network`
- `openpanel-security-secrets-in-env`

**Test command:**
```bash
npx hostinglint examples/vulnerable/openpanel-vulnerable/docker-compose.yml
```

### manifest.json

**Issues:**
- Missing `apiVersion` field in extension manifest

**Rules that should trigger:**
- `openpanel-api-versioning`

**Test command:**
```bash
npx hostinglint examples/vulnerable/openpanel-vulnerable/manifest.json
```

### setup.sh

**Issues:**
- Uses `$1`, `$2`, `$3` positional arguments without validation
- No input sanitization before passing to `mysql` and filesystem operations

**Rules that should trigger:**
- `openpanel-cli-validation`

**Test command:**
```bash
npx hostinglint examples/vulnerable/openpanel-vulnerable/setup.sh
```

### deploy.py

**Issues:**
- Uses `sys.argv` without `argparse` or manual validation
- Unvalidated input passed to `subprocess.run` and filesystem operations

**Rules that should trigger:**
- `openpanel-cli-validation`

**Test command:**
```bash
npx hostinglint examples/vulnerable/openpanel-vulnerable/deploy.py
```

## Running Tests

### Test individual files:
```bash
npx hostinglint examples/vulnerable/whmcs-vulnerable/sql_injection.php
```

### Test entire directory:
```bash
npx hostinglint examples/vulnerable/
```

### Generate JSON report:
```bash
npx hostinglint examples/vulnerable/ --format json > vulnerability-report.json
```

### Generate SARIF for GitHub Code Scanning:
```bash
npx hostinglint examples/vulnerable/ --format sarif > results.sarif
```

## Expected Output

When you run HostingLint against these files, you should see multiple security, compatibility, and best practice violations detected. Example:

```
examples/vulnerable/whmcs-vulnerable/sql_injection.php
  20:5   error   Potential SQL injection vulnerability   security-sql-injection
  21:16  error   Use of deprecated mysql_query function  php-compat-mysql-ext
  28:5   error   Unvalidated user input from $_POST      whmcs-best-input-validation

✖ 3 problems (3 errors, 0 warnings)
```

## Coverage Verification

To verify that HostingLint detects all intended vulnerabilities:

1. Run HostingLint against each file
2. Compare detected issues with documented vulnerabilities above
3. Ensure all expected rules trigger
4. Check that line numbers and descriptions are accurate

## Contributing

If you discover additional common vulnerabilities that should be included in these examples, please open an issue or submit a pull request.

## License

MIT License — Same as the HostingLint project.

These examples are provided for testing and educational purposes only.
